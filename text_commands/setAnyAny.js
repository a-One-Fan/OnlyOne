const { currentCols } = require("../extras/database_stuff.js");
const { getUserFromText } = require("../extras/text_recognition.js");
const { ownerId } = require("../config.json");

module.exports = {
	async execute(message, regexResults, extraRegex) {
		const user = await getUserFromText(regexResults[1], message);
		if (!user) throw Error(`Printable error: Could not find user by ${regexResults[1]}`);

		if (user.id == ownerId && message.author.id != ownerId) throw Error("Printable error: You can't change the owner's properties.");

		if (!currentCols[regexResults[2]]) throw Error(`Printable error: No column ${regexResults[2]} exists.`);

		if (regexResults[2] == "userID") throw Error("Printable error: You can't change that column because it would cause too many headaches. Maybe the ORM won't allow it either");

		const row = await message.client.db.findOne({ where: { userID: user.id } });

		const newprop = {};
		newprop[regexResults[2]] = regexResults[3];
		await message.client.db.update(newprop, { where: { userID: user.id } });

		return { text: `Updated ${regexResults[2]} for user "${user.displayName}" (${user.id}) from [${row[regexResults[2]]}] to [${regexResults[3]}]` };
	},
};