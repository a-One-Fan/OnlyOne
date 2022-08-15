const commandData = require("../text_commands/commands");
const { errorChoose } = require("../configurables/error_message");
const { parseChoose } = require("../configurables/valid_message");

export class TextCommandResult{
	text: string = "";
	files: any[] = [];
	reacts: string[] = [];
	embeds: any[] = [];
}

module.exports = {
	findCommand(text : string) {
		for (const command of commandData.commands) {
			const regexRes = RegExp(command.regex, command.regexParams).exec(text);
			if (regexRes) {
				const extraRes = [];
				if	(command.extraRegex) {
					for (const extraRegex of command.extraRegex) {
						extraRes.push(RegExp(extraRegex, command.regexParams).exec(text));
					}
				}
				const func = require("../text_commands/" + command.name + ".js");
				return [func, regexRes, extraRes, command];
			}
		}
		return undefined;
	},

	async executeCommand(message: any, errorType: object, parseType: object) {
		if (errorType == undefined || parseType == undefined) {
			const row = await message.client.db.findOne({ where: { userID: message.author.id } });
			if (errorType == undefined) errorType = row.errorType;
			if (parseType == undefined) parseType = row.parseType;
		}

		const parsed = parseChoose(message.content, parseType);
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
		const errorRes = errorChoose(err, foundCommand, errorType);
		return commandRes ? commandRes : errorRes;
	},

	mergeMessagePayload(obj1: TextCommandResult, obj2: TextCommandResult) {
		const newObj = new TextCommandResult();

		let prop: keyof TextCommandResult;
		for (prop in newObj) {
			// TODO do not find a solution to this because it's likely a typescript bug, thank you typescript devs; the `as any` should not be needed here
			newObj[prop].concat(obj1[prop] as any);
			newObj[prop].concat(obj2[prop] as any);
		}
		return newObj;
	},

	decoupleMessageReacts(obj: any) {
		const newObj = { text: obj.text, files: obj.files, embeds: obj.embeds };
		return [obj.reacts, newObj];
	},
};