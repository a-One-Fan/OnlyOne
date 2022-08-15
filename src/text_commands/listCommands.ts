import { commands } from "./commands";
import { clamp } from "../extras/math_stuff";

const commandsPerPage = 8;

async function execute(message: any, regexResults: RegExpExecArray) {
	let page = 1;
	if (regexResults[1]) page = parseInt(regexResults[1]);
	const fakePage = page;
	page = clamp(1, Math.ceil(commands.length / commandsPerPage), page);
	const commandsStart = clamp(0, commands.length - 1, (page - 1) * commandsPerPage);
	const commandsEnd = clamp(0, commands.length, page * commandsPerPage);

	let res = "";
	if (page == 1) res = "You may address me by \"One\", \"Lady One\", \"Oh Glorious One\", \"Dear One\" and such other names.\nThen, adressing me, you can ask me the following things:\n";

	for (let i = commandsStart; i < commandsEnd; i++) {
		const command = commands[i];
		if (!command.hidden) res += `[${command.name}]: "${command.help}", ${command.description}\n`;
	}

	const fakePageStr = (page == fakePage) ? `${page}` : `"${fakePage}"`;
	res += `\n(Page ${fakePageStr}/${Math.ceil(commands.length / commandsPerPage)})`;

	return { text: res };
}

export { execute };