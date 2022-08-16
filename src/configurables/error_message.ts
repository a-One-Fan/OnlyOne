const errorEmote = "⚠️";
import { UNKNOWN_COMMAND, TextCommand, TextCommandResult } from "../text_commands/_commands";
import { pickRandom } from "../extras/math_stuff";

function userFriendifyError(error: any) {
	if (!error || !error.message) return "";
	let text = "";
	if (error.message.startsWith("Printable error: ")) text += error.message.substr(17) + "\n";
	if (error.message.startsWith("Bad URL")) text += "It's because I didn't like your URL.\n";
	if (error.message.startsWith("Request failed with status code: ")) text += `It's because the link returned a \`${error.message.substr(33, 3)}\` error code.\n`;
	if (error.message.startsWith("Unrecognized chunk")) text += `I don't know what "${error.message.substr(20, error.message.length - 21)}" is.\n`;
	return text;
}
const errorTypes = [
	// The name should start with something that you could sensibly add "When an error occurs, I will respond with " to, and not end with punctuation.
	{ name: "text, always",
		transformError(error: any, command: TextCommand | undefined, commandRes?: TextCommandResult): TextCommandResult {
			if (!command) return { text: pickRandom(UNKNOWN_COMMAND) };
			return { text: `Looks like something went wrong when trying to execute "${command.name}".\n` + userFriendifyError(error) + "Now try again." };
		},
	},
	{ name: "an emote and, if possible, a more descriptive message",
		transformError(error: any, command: TextCommand | undefined, commandRes?: TextCommandResult): TextCommandResult {
			let descriptiveText = "";
			if (userFriendifyError(error)) descriptiveText = errorTypes[0].transformError(error, command, commandRes).text as string;
			return { emotes: [errorEmote], text: descriptiveText };
		},
	},
	{ name: "only an emote",
		transformError(error: any, command: TextCommand | undefined, commandRes?: TextCommandResult): TextCommandResult {
			return { emotes: [errorEmote] };
		},
	},
	{ name: "a more descriptive message, if possible",
		transformError(error: any, command: TextCommand | undefined, commandRes?: TextCommandResult): TextCommandResult {
			let descriptiveText = ""; // !!                                    This   \/             is very defined, and has .text, right there ^
			if (userFriendifyError(error)) descriptiveText = errorTypes[0].transformError(error, command, commandRes).text as string;
			return { text: descriptiveText };
		},
	},
	{ name: "nothing",
		transformError(error: any, command: TextCommand | undefined, commandRes?: TextCommandResult): TextCommandResult {
			return {};
		},
	},
]
function errorChoose(error: any, command: TextCommand | undefined, id: number) {
	return errorTypes[id].transformError(error, command);
}
const unknownErrorType = "Unknown error type";
const listText = "Whenever an error occurs, I can send the following";

export { userFriendifyError, errorTypes, errorChoose, unknownErrorType, listText };