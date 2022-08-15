const { pickRandom } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message: any, regexResults: string) {
		const responses = ["I'm glad that you are.", "Alright.", "Good for you.",
			"That doesn't sound good.", "I hope you're not in the future.", "Too bad...", "I'm busy right now.",
			"Please ask me another time.", "That you are.", `Are you hoping for a "Hello [${regexResults[1].substring(0, 8)}...], I'm One!" ?\nYou're not going to get that from me.`,
			"I regret reading your message.", "I'm happy I read that." ];

		return { text: pickRandom(responses) };
	},
};