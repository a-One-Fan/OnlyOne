import { pickRandom } from "../extras/math_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {
	const responses = ["Thanks.", "Thanks.", "OK.", "I don't think so.", "I guess I am.", "I guess so.", "If you say so.", "Oh really?", "I'd rather not be that, then.",
		"No, I'm not.", `Are *you* "${regexResults[1]}"?`, "You can flatter me all you want but don't expect something in return."];

	return { text: pickRandom(responses) };
}

export { execute }