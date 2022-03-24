const { reactTypes } = require("../configurables/message_reacts.js");
const { parseTypes } = require("../configurables/valid_message.js");
const { errorTypes } = require("../configurables/error_message.js");

const enums = [reactTypes, parseTypes, errorTypes];

module.exports = {
	execute(message, regexResults) {
		let enumID = 0;
		for (let i = 0; i < enums.length(); i++) {
			if (regexResults[i + 1]) {
				enumID = i;
				break;
			}
		}

		let res = enums[enumID].listText;

		for (const [i, type] of enums[enumID].entries()) {
			const nameCap = type.name[0].toUpperCase() + type.name.substring(1);
			res += `${i}: ${nameCap}.\n`;
		}

		if (enumID == 0) res += "Keep in mind that you can change your reaction chance as well.\n";

		return { text: res };
	},
};