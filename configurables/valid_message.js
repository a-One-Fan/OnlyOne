const { validStart, validEnd } = require("../extras/text_recognition.js");

module.exports = {
	parseTypes: [
		// The name should start with something that you could sensibly add "I will recognize as a valid text command " to, and not end with punctuation.
		{ name: "when you refer to me only at the start of your message",
			testParse(text) {
				const res = validStart(text);

				return { valid: Boolean(res), culledText: res ? res[1] : "" };
			},
		},
		{ name: "when you refer to me only at the end of your message",
			testParse(text) {
				const res = validEnd(text);

				return { valid: Boolean(res), culledText: res ? res[1] : "" };
			},
		},
		{ name: "when you refer to me at the start and/or end of your message",
			testParse(text) {
				const startCut = validStart(text);
				let bothCut = "";
				if (!startCut) {
					const endCut = validEnd(text);
					if (endCut) bothCut = endCut[1];
				} else {
					const endCut = validEnd(startCut[1]);
					if (endCut) bothCut = endCut[1];
					else bothCut = startCut[1];
				}
				return { valid: Boolean(bothCut), culledText: bothCut };
			},
		},
		{ name: "when you refer to me at the start and/or end of your message, or start with \".one\"",
			testParse(text) {
				if (text.substr(0, 4) == ".one") return { valid: true, culledText: text.substr(4) };
				return module.exports.parseTypes[2].testParse(text);
			},
		},
		{ name: "any message, as well as ones that refer to me at the start/end or start with \".one\"",
			testParse(text) {
				const tested = module.exports.parseTypes[3].testParse(text);
				if (!tested.valid) return { valid: true, culledText: text };
				return tested;
			},
		},
	],
	parseChoose(text, id) {
		return module.exports.parseTypes[id].testParse(text);
	},
	unknownParseType: "Unknown parse type",
	listText: "I will consider as a valid command",
};