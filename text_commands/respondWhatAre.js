const { pickRandom } = require("../extras/mathStuff");

module.exports = {
	async execute(message, regexResults) {
		let responses = [];
		if (regexResults[1] == "is") {
			responses = ["I'm doing fine, thanks for asking.", "I'm fine.", "I'm feeling slightly happier right now. I haven't felt like that in a while.",
				"I'm not feeling particularly great, sorry.", "I'm peeved.", "I'm feeling uneasy right now.",
				"I'm glad you're concerned about me. I'm alright."];
		} else {
			responses = ["I'm doing fine, thanks for asking.", "I'm fine.", "I'm feeling slightly happier right now. I haven't felt like that in a while.",
				"I'm not feeling particularly great, sorry.", "I'm peeved.", "I'm feeling uneasy right now.",
				"I'm glad you're concerned about me. I'm alright."];
		}

		return { text: pickRandom(responses) };
	},
};