const { countOnes } = require("../extras/text_recognition.js");
const commandData = require("../text_commands/commands.json");
const { reactChoose } = require("../configurables/message_reacts.js");
const { errorChoose } = require("../configurables/error_message.js");
const { parseChoose } = require("../configurables/valid_message.js");

module.exports = {
	name: "messageCreate",
	async execute(message) {
		console.log(`Got message! From: ${message.author.id}`);

		if (message.author.bot) return;


		// TODO: Make this if here better somehow?
		let textContent = "";
		let firstCommand = false;
		if (message.content == commandData.unignore) {
			firstCommand = true;
			const row = await message.client.db.findOne({ where: { userID: message.author.id } });
			textContent += "Alright.";
			if (!row) {
				textContent += " Looks like it's our first time.\n";
				try {
					await message.client.db.create({ userID: message.author.id, ignore: false });
				} catch (error) {
					if (error.name === "SequelizeUniqueConstraintError") {
						// This should be impossible?
						textContent += "There's already an entry in the DB...\n";
					} else {
						textContent += `Something else went wrong: "${error.name}": ${error.message}\n`;
					}
				}
			} else {
				if (!row.ignore) textContent += ".. Though you already can.\n";
				await message.client.db.update({ ignore: false }, { where: { userID: message.author.id } });
			}
		}

		let row = await message.client.db.findOne({ where: { userID: message.author.id } });
		if (!row || row.ignore) { return; }
		const oneCount = countOnes(message.content);

		message.client.db.update({ upperOne: row.upperOne + oneCount[1], lowerOne: row.lowerOne + oneCount[2], digitOne: row.digitOne + oneCount[3] }, { where: { userID: message.author.id } });
		const emotes = reactChoose(message, row, oneCount);

		row = await message.client.db.findOne({ where: { userID: message.author.id } });
		const split = parseChoose(message.content, row.parseType);

		let commandRes = null;
		// TODO: Is there a better way to do this without this flag? Or is this good enough
		let commandError = false;
		if (split.valid && !firstCommand) {
			// TODO: better names
			for (const command of commandData.commands) {
				const reactRes = RegExp(command.regex, command.regexParams).exec(split.culledText);
				if (reactRes) {
					try {
						const extraRes = [];
						if	(command.extraRegex) {
							for (const extraRegex of command.extraRegex) {
								extraRes.push(RegExp(extraRegex, command.regexParams).exec(split.culledText));
							}
						}
						const func = require("../text_commands/" + command.name + ".js");
						commandRes = await func.execute(message, reactRes, extraRes);
					} catch (error) {
						commandError = true;
						// TODO: DM the error to me? :)
						// TODO: make function that merges to-be message things like emotes, files, text, etc.
						const res = errorChoose(error, command, row.errorType);
						if (res.text) textContent += res.text;
						if (res.emotes) emotes.concat(res.emotes);
						console.log(error);
					}
					break;
				}
			}
			if (!commandRes) {
				if (!commandError) textContent += commandData.unknown[Math.floor(Math.random() * commandData.unknown.length)];
				else textContent += "Now try again.\n";
			}
		}

		if ((commandRes && !(commandRes.abortReact)) || !commandRes) {
			for (const emot of emotes) {
				message.react(emot);
			}
		}

		if (commandRes && commandRes.text) {
			textContent += commandRes.text;
		}

		let _files = [];
		if (commandRes && commandRes.files) _files = commandRes.files;

		if (textContent != "" || _files != "") {
			if (_files != "") message.reply({ content: textContent, allowedMentions: { repliedUser: false }, files: _files });
			else message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
		}
	},
};