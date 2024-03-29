import { pickRandom } from "../extras/math_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {
	let responses = [];
	if (regexResults[1] == "is" || regexResults[1] == "'s" || regexResults[1] == "s") {
		responses = ["Me.", "You.", "Two.", "Three.", "Four.", "Five.", "Zero.", "No one.", "You!", "Not me."];
	} else {
		responses = ["Please give me plural whoIs responses :("];
	}

	return { text: pickRandom(responses) };
}

export { execute }