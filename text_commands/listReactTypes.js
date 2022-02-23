const { reactTypes } = require("../message_reacts.js");

module.exports = {
	async execute(message, regexResults) {
		let res = "I can react to you in the following ways:\n";
		for (const [i, reactType] of reactTypes.entries()) {
			const nameCap = reactType.name[0].toUpperCase() + reactType.name.substring(1);
			res += `${i}: ${nameCap}.\n`;
		}
		res += "Keep in mind that you can change your reaction chance as well.\n";
		return { text: res };
	},
};