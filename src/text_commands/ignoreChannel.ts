import { readFileSync, writeFileSync } from "fs";
import { ignoredChannelsFilepath } from "../config.json";
import { find, remove } from "../extras/math_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {
	const ignored = JSON.parse(readFileSync(ignoredChannelsFilepath).toString());
	let channelId = "";

	// If the message has "this"
	if (regexResults[2]) {
		channelId = message.channelId;
	}
	// A written ID of the channel
	if (regexResults[3]) {
		channelId = regexResults[3];
	}

	// Name of the channel
	if (regexResults[4]) {
		const foundChannel = message.channel.guild.channels.cache.find((channel: any) => channel.name.toLowerCase() == regexResults[4].toLowerCase());
		channelId = foundChannel.id;
	}

	// If the message asks to ignore
	if (!regexResults[1]) {
		if (find(ignored.channels, channelId) >= 0) {
			throw Error("Printable error: That channel is already ignored.");
		}
		ignored.channels.push(channelId);
		writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignored, null, 4));
		return { text: `Ignoring channel <#${channelId}>${regexResults[2] ? " (this channel)" : ""}.` };
	}

	ignored.channels = remove(ignored.channels, channelId);
	writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignored, null, 4));

	return { text: `Unignoring channel <#${channelId}>.` };
}

export { execute };