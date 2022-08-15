const errorEmote = "⚠️";
const { unknown } = require("../text_commands/commands.json");
const { pickRandom } = require("../extras/math_stuff");

import { TextCommand } from "../text_commands/commands"
import { TextCommandResult } from  "../text_commands/text_command_utils"

module.exports = {
	userFriendifyError(error: Error) {
		if (!error || !error.message) return "";
		let text = "";
		if (error.message.startsWith("Printable error: ")) text += error.message.substr(17) + "\n";
		if (error.message.startsWith("Bad URL")) text += "It's because I didn't like your URL.\n";
		if (error.message.startsWith("Request failed with status code: ")) text += `It's because the link returned a \`${error.message.substr(33, 3)}\` error code.\n`;
		if (error.message.startsWith("Unrecognized chunk")) text += `I don't know what "${error.message.substr(20, error.message.length - 21)}" is.\n`;
		return text;
	},
	errorTypes: [
		// The name should start with something that you could sensibly add "When an error occurs, I will respond with " to, and not end with punctuation.
		{ name: "text, always",
			transformError(error: Error, command: TextCommand, commandRes: TextCommandResult) {
				if (!command) return { text: pickRandom(unknown) };
				return { text: `Looks like something went wrong when trying to execute "${command.name}".\n` + module.exports.userFriendifyError(error) + "Now try again." };
			},
		},
		{ name: "an emote and, if possible, a more descriptive message",
			transformError(error: Error, command: TextCommand, commandRes: TextCommandResult) {
				let descriptiveText = "";
				if (module.exports.userFriendifyError(error)) descriptiveText = module.exports.errorTypes[0].transformError(error, command, commandRes);
				return { emotes: [errorEmote], text: descriptiveText };
			},
		},
		{ name: "only an emote",
			transformError(error: Error, command: TextCommand, commandRes: TextCommandResult) {
				return { emotes: [errorEmote] };
			},
		},
		{ name: "a more descriptive message, if possible",
			transformError(error: Error, command: TextCommand, commandRes: TextCommandResult) {
				let descriptiveText = "";
				if (module.exports.userFriendifyError(error)) descriptiveText = module.exports.errorTypes[0].transformError(error, command, commandRes);
				return { text: descriptiveText };
			},
		},
		{ name: "nothing",
			transformError(error: Error, command: TextCommand, commandRes: TextCommandResult) {
				return {};
			},
		},
	],
	errorChoose(error: Error, command: TextCommand, id: number) {
		return module.exports.errorTypes[id].transformError(error, command);
	},
	unknownErrorType: "Unknown error type",
	listText: "Whenever an error occurs, I can send the following",
};