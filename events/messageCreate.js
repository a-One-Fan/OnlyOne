const { validStart, countOnes } = require("../extras/text_recognition.js");
const commandData = require("../text_commands/commands.json");
const { reactChoose } = require("../message_reacts.js");

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
		const split = validStart(message.content);

		let commandRes = null;
		if (split && !firstCommand) {
			// TODO: better names
			for (const command of commandData.commands) {
				const reactRes = RegExp(command.regex).exec(split[1]);
				if (reactRes) {
					try {
						const func = require("../text_commands/" + command.name + ".js");
						commandRes = await func.execute(message, reactRes);
					} catch (error) {
						// TODO: DM the error to me? :)
						textContent += `Looks like something when wrong when executing "${command.name}".\n`;
						console.log(error);
					}
					break;
				}
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

		if (textContent != "") {
			message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
		}
	},
};