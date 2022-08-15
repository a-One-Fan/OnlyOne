import { validStart, validEnd } from "../extras/text_recognition";

interface ParseTestResult {
	valid: boolean;
	culledText: string;
}

const parseTypes = [
	// The name should start with something that you could sensibly add "I will recognize as a valid text command " to, and not end with punctuation.
	{ name: "when you refer to me only at the start of your message",
		testParse(text: string): ParseTestResult {
			const res = validStart(text);

			return { valid: Boolean(res), culledText: res ? res[1] : "" };
		},
	},
	{ name: "when you refer to me only at the end of your message",
		testParse(text: string): ParseTestResult {
			const res = validEnd(text);

			return { valid: Boolean(res), culledText: res ? res[1] : "" };
		},
	},
	{ name: "when you refer to me at the start and/or end of your message",
		testParse(text: string): ParseTestResult {
			const startCut = validStart(text);
			let bothCut = "";
			let endCut: [number, string] | undefined;
			if (!startCut) {
				endCut = validEnd(text);
				if (endCut) bothCut = endCut[1];
			} else {
				endCut = validEnd(startCut[1]);
				if (endCut) bothCut = endCut[1];
				else bothCut = startCut[1];
			}
			return { valid: Boolean(bothCut), culledText: bothCut };
		},
	},
	{ name: "when you refer to me at the start and/or end of your message, or start with \".one\"",
		testParse(text: string): ParseTestResult {
			if (text.substr(0, 4) == ".one") return { valid: true, culledText: text.substr(4) };
			return parseTypes[2].testParse(text);
		},
	},
	{ name: "any message, as well as ones that refer to me at the start/end or start with \".one\"",
		testParse(text: string): ParseTestResult {
			const tested = parseTypes[3].testParse(text);
			if (!tested.valid) return { valid: true, culledText: text };
			return tested;
		},
	},
]
function parseChoose(text: string, id: number) {
	return parseTypes[id].testParse(text);
}
const unknownParseType = "Unknown parse type";
const listText = "I will consider as a valid command";

export { parseTypes, parseChoose, unknownParseType, listText };