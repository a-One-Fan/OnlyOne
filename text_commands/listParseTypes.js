const { parseTypes } = require("../configurables/valid_message.js");

module.exports = {
	// TODO: streamline this code?
	execute(message, regexResults) {
		let res = "I will consider as a valid command:\n";
		for (const [i, parseType] of parseTypes.entries()) {
			const nameCap = parseType.name[0].toUpperCase() + parseType.name.substring(1);
			res += `${i}: ${nameCap}.\n`;
		}
		return { text: res };
	},
};