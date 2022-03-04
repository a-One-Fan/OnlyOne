const { pickRandom } = require("../extras/math_stuff");

module.exports = {
	async execute(message, regexResults) {
		let responses = [];
		if (regexResults[1] == "is" || regexResults[1] == "'s" || regexResults[1] == "s") {
			responses = ["1.", "11.", "10.", "100.", "111.", "101.", "A dog.", "A cat.", "A dragon.", "It's pointless.", "It's crazy.", "It's stupid.", 
				"It's mildly annoying.", "It's something I don't really care about."];
		} else {
			responses = ["They're stupid.", "They're somewhere they should not be."];
		}

		return { text: pickRandom(responses) };
	},
};