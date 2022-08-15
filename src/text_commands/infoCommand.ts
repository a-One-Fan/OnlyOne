import { commands, TextCommand } from "./commands";

async function execute(message: any, regexResults: RegExpExecArray) {
	let command: TextCommand | undefined = undefined;
	for (const c of commands) {
		if (c.name == regexResults[1]) {
			command = c;
			break;
		}
	}
	if (typeof command === "undefined") {
		return { text: `Could not find command "${regexResults[1]}".` };
	}
	let resText = "";
	resText += `[${command.name}]\nSay "${command.help}" to trigger the command.\n${command.description}\n`;
	if (command.extraHelp) {
		resText += command.extraHelp;
	}
	return { text: resText };
}

export { execute }