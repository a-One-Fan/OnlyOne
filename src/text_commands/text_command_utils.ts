import { TextCommand, commands } from "../text_commands/commands";
import { errorChoose } from "../configurables/error_message";
import { parseChoose } from "../configurables/valid_message";

export class TextCommandResult{
	text?: string = "";
	files?: any[] = [];
	emotes?: string[] = [];
	embeds?: any[] = [];
}

function findCommand(text: string): [any, RegExpExecArray, (RegExpExecArray|null)[], TextCommand ] | undefined {
	for (const command of commands) {
		const regexRes = command.regex.exec(text);
		if (regexRes) {
			const extraRes = [];
			if	(command.extraRegex) {
				for (const extraRegex of command.extraRegex) {
					extraRes.push(extraRegex.exec(text));
				}
			}
			const func = import("../text_commands/" + command.name + ".js");
			return [func, regexRes, extraRes, command];
		}
	}
	return undefined;
}

async function executeCommand(message: any, errorType?: number, parseType?: number) {
	if (errorType == undefined || parseType == undefined) {
		const row = await message.client.db.findOne({ where: { userID: message.author.id } });
		if (errorType == undefined) errorType = row.errorType;
		if (parseType == undefined) parseType = row.parseType;
	}

	const parsed = parseChoose(message.content, parseType as number);
	if (!parsed || !parsed.valid) return {};

	let err = undefined, commandRes = undefined, foundCommand = undefined;
	const res = module.exports.findCommand(parsed.culledText);
	const row = await message.client.db.findOne({ where: { userID: message.author.id } });
	if (res) {
		const [func, regexRes, extraRes, _foundCommand] = res;
		foundCommand = _foundCommand;
		if (foundCommand.rank && row.rank < foundCommand.rank) {
			err = { message: `Printable error: Your rank (${row.rank}) is too low to execute this command (${foundCommand.rank}).` };
		} else {
			try {
				commandRes = await func.execute(message, regexRes, extraRes);
			} catch (error) {
				err = error;
				console.log(err);
			}
		}
	}
	// TODO: DM the error to me? :)
	// !! TS fail                                       \/
	const errorRes = errorChoose(err, foundCommand, errorType as number);
	return commandRes ? commandRes : errorRes;
}

function mergeMessagePayload(obj1: TextCommandResult, obj2: TextCommandResult) {
	const newObj = new TextCommandResult();

	let prop: keyof TextCommandResult;
	for (prop in newObj) {
		// !! Extreme typescript paranoia here
		(newObj[prop] as any).concat(obj1[prop] as any);
		(newObj[prop] as any).concat(obj2[prop] as any);
	}
	return newObj;
}

function decoupleMessageReacts(obj: TextCommandResult) {
	const newObj = { text: obj.text, files: obj.files, embeds: obj.embeds };
	return [obj.emotes, newObj];
}

export { findCommand, executeCommand, mergeMessagePayload, decoupleMessageReacts };