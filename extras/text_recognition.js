const { openersBase, openersPunctuation, openersAdjectives, oneRegexes } = require("../config.json");
const { remove } = require("./math_stuff.js");

module.exports = {
	// Whether 'text' matches any regex of "customOpeners"
	// Returns the index of the regex and the rest of 'text' if valid, null otherwise.
	// TODO: refactor regexes and use no whitespace option so they're actually readable?
	testAnyRegex(text, customOpeners, regexParams = "") {
		if (text == null) return null;
		for (const [i, opener] of customOpeners.entries()) {
			const split = text.split(RegExp(opener, regexParams));
			if (split.length > 1) {
				return [i, remove(split, "")[0]];
			}
		}
		return null;
	},

	flattenArraySeparate(arr, separator) {
		let res = "";
		for (let i = 0; i < arr.length - 1; i++) {
			res += arr[i];
			res += separator;
		}
		res += arr.at(-1);
		return res;
	},

	makeOpenerRegex() {
		const flatn = module.exports.flattenArraySeparate;
		let puncts = flatn(openersPunctuation, "");
		puncts += "\\s";
		const adjs = flatn(openersAdjectives, "|");
		const base = flatn(openersBase, "|");
		return `(?:[${puncts}\\s]{1,5})?(?:(?:${adjs})[${puncts}]{1,5})*\\s*(?:(?:${base})[${puncts}]{1,5})\\s*(?:(?:${adjs})[${puncts}]{1,5})*(?:[${puncts}\\s]{1,5})?`;
	},

	// Whether 'text' starts with a regex from the config (a One-related opener).
	validStart(text) {
		const newOpeners = [];
		const openers = [module.exports.makeOpenerRegex()];
		for (const opener of openers) {
			newOpeners.push("^\\s*" + opener + "\\s*");
		}
		return module.exports.testAnyRegex(text, newOpeners, "i");
	},

	validEnd(text) {
		const newOpeners = [];
		const openers = [module.exports.makeOpenerRegex()];
		for (const opener of openers) {
			newOpeners.push("\\s*" + opener + "\\s*$");
		}
		return module.exports.testAnyRegex(text, newOpeners, "i");
	},

	// Counts how many times 'text' has each string regex in 'bits' in it.
	// Returns an array with the total, followed by the number of occurences of each thing.
	countOcurrences(text, bits) {
		if (text == null) return null;

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
		return res;
	},

	// Counts how many times the user mentioned One.
	// Returns: [Total, One mentions, one mentions, 1 mentions]
	countOnes(text) {
		return module.exports.countOcurrences(text, oneRegexes);
	},

	// TODO: Should this be in this file?
	mergeMessagePayload(obj1, obj2) {
		const newObj = { text: "", files: [], reacts: [], embeds: [] };
		for (const prop in newObj) {
			if (obj1[prop]) newObj[prop].concat(obj1[prop]);
			if (obj2[prop]) newObj[prop].concat(obj2[prop]);
		}
		return newObj;
	},

	decoupleMessageReacts(obj) {
		const newObj = { text: obj.text, files: obj.files, embeds:obj.embeds };
		return [obj.reacts, newObj];
	},
};
