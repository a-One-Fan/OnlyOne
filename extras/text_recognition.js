const { openers } = require("../config.json");

module.exports = {
	// Whether 'text' starts with a string regex from 'customOpeners'.
	// Returns the index of the regex and the rest of 'text' if valid, null otherwise.
	startsWith(text, customOpeners, regexParams) {
		if (text == null) return null;
		for (const [i, opener] of customOpeners.entries()) {
			const split = text.split(RegExp("^\\s*" + opener + "\\s*", regexParams));
			if (split.length > 1) return [i, split[1]];
		}
		return null;
	},

	// Whether 'text' starts with a regex from the config (a One-related opener).
	// TODO: How the fuck am I supposed to de-duplicate this code??? For some insane reason this.startsWith() won't import properly!
	validStart(text) {
		if (text == null) return null;
		const customOpeners = openers;
		const regexParams = "i";

		for (const [i, opener] of customOpeners.entries()) {
			const split = text.split(RegExp("^\\s*" + opener + "\\s*", regexParams));
			if (split.length > 1) return [i, split[1]];
		}
		return null;
	},

	// Counts how many times 'text' has each string regex in 'bits' in it.
	// Returns an array with the total, followed by the number of occurences of each thing.
	countOcurrences(text, bits) {
		if (text == null) return null;
		const res = [0];
		for (const bit of bits.entries()) {
			const matched = text.match(RegExp(bit + "/g"));
			let count = 0;
			if (matched != null) count = matched.length;
			res.push(count);
			res[0] += count;
		}
		if (res[0] == 0) return null;
		return res;
	},

	// Counts how many times the user mentioned One.
	// Returns: [Total, One mentions, one mentions, 1 mentions]
	// About code deduplication, see above: how?????
	countOnes(text) {
		if (text == null) return null;
		const bits = ["[\\s,.?!a-z]One[\\s,.?!A-Z]", "[\\s,.?!]one[\\s,.?!A-Z]", "1"];

		const res = [0];
		text = " " + text + " ";
		for (const bit of bits) {
			let textCut = text;
			let foundIdx = textCut.search(RegExp(bit));
			let count = 0;
			// Special code needed to match Regexes that slightly overlap, e.g.:
			// One One One One One
			// All of these are separated by 1 whitespace, by themselves they fit the regex but running the regex globally would "eat" the space from the first " One ", ending up with "One One One One ",
			// won't match that first One in the remaining string. Using ^ here won't fix this, as this isn't really the start of the string.
			while (foundIdx >= 0) {
				textCut = textCut.substr(foundIdx + 1);
				foundIdx = textCut.search(RegExp(bit));
				count++;
			}

			res.push(count);
			res[0] += count;
		}
		console.log(text, res);
		if (res[0] == 0) return null;
		return res;
	},
};
