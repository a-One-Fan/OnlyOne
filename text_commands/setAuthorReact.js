const { reactTypes } = require("../message_reacts.js");

module.exports = {
	async execute(message, regexResults) {
		const type = parseInt(regexResults[1]);
		if (type < 0 || type >= reactTypes.length) {
			return { text: `"${type}" isn't a valid number. Please use a valid number.\n` };
		}

		await message.client.db.update({ reactType: type }, { where: { userID: message.author.id } });
		return { text: `I've set your react type to '${reactTypes[type].name}' (${type}) from here on.\n` };
	},
};