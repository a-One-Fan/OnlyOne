const { errorTypes } = require("../configurables/error_message.js");

module.exports = {
	// TODO: streamline this code?
	execute(message, regexResults) {
		let res = "Whenever an error occurs, I can do the following:\n";
		for (const [i, errorType] of errorTypes.entries()) {
			const nameCap = errorType.name[0].toUpperCase() + errorType.name.substring(1);
			res += `${i}: ${nameCap}.\n`;
		}
		return { text: res };
	},
};