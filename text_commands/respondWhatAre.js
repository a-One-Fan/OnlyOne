const { pickRandom } = require("../extras/math_stuff");

module.exports = {
	async execute(message, regexResults) {
		let responses = [];
		if (regexResults[1] == "is" || regexResults[1] == "'s" || regexResults[1] == "s") {
			responses = ["1.", "11.", "10.", "100.", "111", "101", "A dog.", "A cat.", "A dragon.", "It's pointless.", "Crazy."];
		} else {
			responses = ["Please give me plural whatIs responses :("];
		}

		return { text: pickRandom(responses) };
	},
};