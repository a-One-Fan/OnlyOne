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
		const bits = ["\\sOne[\\s,.?!]|^One[\\s,.?!]|\\sOne$", "\\sone[\\s,.?!]|^one[\\s,.?!]|\\sone$", "1"];

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
};
