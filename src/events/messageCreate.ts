import { countOnes } from "../extras/text_recognition";
import { UNIGNORE_SELF, UNIGNORE_CHANNEL } from "../text_commands/commands";
import { ownerId, ignoredChannelsFilepath } from "../config.json";
import { reactChoose } from "../configurables/message_reacts.js";
import { executeCommand } from "../text_commands/text_command_utils.js";
import { find, remove } from "../extras/math_stuff";
import { rm, statSync, readFileSync, writeFileSync } from "fs";

let ignoredChannelsModified = new Date();
let ignoredChannels: {channels: string[]} = {channels: []};

const name = "messageCreate";

async function execute(message: any) {
	const checkIgnoredModified = statSync(ignoredChannelsFilepath).mtime;
	if (checkIgnoredModified != ignoredChannelsModified) {
		ignoredChannels = JSON.parse(readFileSync(ignoredChannelsFilepath).toString());
		ignoredChannelsModified = checkIgnoredModified;
	}
	if (find(ignoredChannels.channels, message.channelId) >= 0) {
		if ((message.author.id == ownerId) && (message.content == UNIGNORE_CHANNEL)) {
			ignoredChannels.channels = remove(ignoredChannels.channels, message.channel);
			writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignoredChannels, null, 4));
			console.log("Unignoring channel \\/");
			await message.reply({ content: "Alright, I'm unignoring this channel." });
		}

		console.log(`Message in ignored channel ${message.channelId}`);

		return ;
	}
	console.log(`Got message! From: ${message.author.id}`);

	if (message.author.bot) return;


	// TODO: Make this if here better somehow?
	let textContent = "";
	let firstCommand = false;
	if (message.content == UNIGNORE_SELF) {
		firstCommand = true;
		const row = await message.client.db.findOne({ where: { userID: message.author.id } });
		textContent += "Alright.";
		if (!row) {
			textContent += " Looks like it's our first time.\n";
			try {
				await message.client.db.create({ userID: message.author.id, ignore: false });
			} catch (error: any) {
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

	if (message.author.id == ownerId) {
		await message.client.db.update({ rank: 111 }, { where: { userID: message.author.id } });
	}

	const row = await message.client.db.findOne({ where: { userID: message.author.id } });
	if (!row || row.ignore) { return; }
	const oneCount = countOnes(message.content);

	message.client.db.update({ upperOne: row.upperOne + oneCount[1], lowerOne: row.lowerOne + oneCount[2], digitOne: row.digitOne + oneCount[3] }, { where: { userID: message.author.id } });
	let emotes = reactChoose(message, row, oneCount);

	let commandRes = null;
	if (!firstCommand) commandRes = await executeCommand(message);

	if (commandRes && commandRes.emotes) emotes = emotes.concat(commandRes.emotes);

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
		if (_files != "") await message.reply({ content: textContent, allowedMentions: { repliedUser: false }, files: _files });
		else await message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
	}

	if (commandRes && commandRes.cleanup) rm(commandRes.cleanup, { recursive: true, force: true }, (err) => { if (err) console.log("Got error while deleting:", err); });
}

export { name, execute };