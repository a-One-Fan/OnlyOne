const { reactTypes } = require("../configurables/message_reacts.js");
const { parseTypes } = require("../configurables/valid_message.js");
const { errorTypes } = require("../configurables/error_message.js");

const enums = [reactTypes, parseTypes, errorTypes];
const enumNames = ["reactType", "parseType", "errorType"];
const enumPrintNames = ["reaction", "valid command messages", "error handling"];

module.exports = {
	async execute(message: any, regexResults: string[]) {
		let enumID = 0;
		for (let i = 0; i < enums.length; i++) {
			if (regexResults[i + 1]) {
				enumID = i;
				break;
			}
		}

		const type = parseInt(regexResults[1 + enums.length]);


		if (type < 0 || type >= enums[enumID].length) {
			return { text: `"${type}" isn't a valid number. Please use a valid number.\n` };
		}

		const newprop: any = {};
		newprop[enumNames[enumID]] = type;
		await message.client.db.update(newprop, { where: { userID: message.author.id } });
		return { text: `I've set your ${enumPrintNames[enumID]} type to '${enums[enumID][type].name}' (${type}) from here on.\n` };
	},
};