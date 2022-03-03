const { commands } = require("./commands.json");

module.exports = {
	async execute(message, regexResults) {
		let command = [];
		for (const c of commands) {
			if(c.name == regexResults[1]) {
				command = c;
				break;
			}
		}
		if (command == []) {
			return { text: `Could not find command "${regexResults[1]}".` };
		}
		let resText = "";
		resText += `[${command.name}]\nSay "${command.help}" to trigger the command.\n${command.description}\n`;
		if (command.extraHelp) {
			resText += command.extraHelp;
		}
		return { text: resText };
	},
};