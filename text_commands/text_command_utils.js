const commandData = require("../text_commands/commands.json");
const { errorChoose } = require("../configurables/error_message.js");
const { parseChoose } = require("../configurables/valid_message.js");

module.exports = {
	findCommand(text) {
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

	async executeCommand(message, errorType, parseType) {
		if (errorType == undefined || parseType == undefined) {
			const row = await message.client.db.findOne({ where: { userID: message.author.id } });
			if (errorType == undefined) errorType = row.errorType;
			if (parseType == undefined) parseType = row.parseType;
		}

		const parsed = parseChoose(message.content, parseType);
		if (!parsed) return {};

		const [func, regexRes, extraRes, foundCommand] = module.exports.findCommand(parsed);
		let err = undefined, commandRes = undefined;
		try {
			commandRes = await func.execute(message, regexRes, extraRes);
		} catch (error) {
			err = error;
		}

		// TODO: DM the error to me? :)
		const errorRes = errorChoose(err, foundCommand, commandRes, errorType);

		return commandRes ? commandRes : errorRes;
	},

	mergeMessagePayload(obj1, obj2) {
		const newObj = { text: "", files: [], reacts: [], embeds: [] };
		for (const prop in newObj) {
			if (obj1[prop]) newObj[prop].concat(obj1[prop]);
			if (obj2[prop]) newObj[prop].concat(obj2[prop]);
		}
		return newObj;
	},

	decoupleMessageReacts(obj) {
		const newObj = { text: obj.text, files: obj.files, embeds: obj.embeds };
		return [obj.reacts, newObj];
	},
};