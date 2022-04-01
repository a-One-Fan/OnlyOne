const { countOnes } = require("../extras/text_recognition.js");
const commandData = require("../text_commands/commands.json");
const { reactChoose } = require("../configurables/message_reacts.js");
const { executeCommand } = require("../text_commands/text_command_utils.js");

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

		const row = await message.client.db.findOne({ where: { userID: message.author.id } });
		if (!row || row.ignore) { return; }
		const oneCount = countOnes(message.content);

		message.client.db.update({ upperOne: row.upperOne + oneCount[1], lowerOne: row.lowerOne + oneCount[2], digitOne: row.digitOne + oneCount[3] }, { where: { userID: message.author.id } });
		let emotes = reactChoose(message, row, oneCount);

		let commandRes = null;
		if (firstCommand) commandRes = executeCommand(message);

		if (commandRes.emotes) emotes = emotes.concat(commandRes.emotes);

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