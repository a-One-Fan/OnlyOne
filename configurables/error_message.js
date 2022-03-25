const errorEmote = "⚠️";

module.exports = {
	userFriendifyError(error) {
		let text = "";
		if (error.message.startsWith("Bad URL")) text += "It's because I didn't like your URL.\n";
		if (error.message.startsWith("Request failed with status code: ")) text += `It's because the link returned a \`${error.message.substr(33, 3)}\` error code.\n`;
		if (error.message.startsWith("Unrecognized chunk")) text += `I don't know what "${error.message.substr(20, error.message.length - 21)}" is.\n`;
		return text;
	},
	errorTypes: [
		// The name should start with something that you could sensibly add "When an error occurs, I will respond with " to, and not end with punctuation.
		{ name: "text, always",
			transformError(error, command) {
				return { text: `Looks like something when wrong when executing "${command.name}".\n` + module.exports.userFriendifyError(error) };
			},
		},
		{ name: "an emote and, if possible, a more descriptive message",
			transformError(error, command) {
				let descriptiveText = module.exports.userFriendifyError(error);
				if (descriptiveText) descriptiveText = `Looks like something when wrong when executing "${command.name}".\n` + descriptiveText;
				return { emotes: [errorEmote], text: descriptiveText };
			},
		},
		{ name: "only an emote",
			transformError(error, command) {
				return { emotes: [errorEmote] };
			},
		},
		{ name: "a more descriptive message, if possible",
			transformError(error, command) {
				let descriptiveText = module.exports.userFriendifyError(error);
				if (descriptiveText) descriptiveText = `Looks like something when wrong when executing "${command.name}".\n` + descriptiveText;
				return { text: descriptiveText };
			},
		},
		{ name: "nothing",
			transformError(error, command) {
				return {};
			},
		},
	],
	errorChoose(error, command, id) {
		return module.exports.errorTypes[id].transformError(error, command);
	},
	unknownErrorType: "Unknown error type",
	listText: "Whenever an error occurs, I can send the following",
};