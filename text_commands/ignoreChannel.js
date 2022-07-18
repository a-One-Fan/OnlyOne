const { readFileSync, writeFileSync } = require("fs");
const { ignoredChannelsFilepath } = require("../config.json");
const { find, remove } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message, regexResults, extraRegex) {
		const ignored = JSON.parse(readFileSync(ignoredChannelsFilepath));
		let channelId = "";

		// If the message has "this"
		if (regexResults[2]) {
			channelId = message.channelId;
		} else {
			// A written ID of the channel
			channelId = regexResults[3];
		}

		// If the message asks to ignore
		if (!regexResults[1]) {
			if (find(ignored.channels, channelId) >= 0) {
				throw Error("Printable error: That channel is already ignored.");
			}
			ignored.channels.push(channelId);
			writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignored, null, 4));
			return { text: `Ignoring channel ${channelId}${regexResults[2] ? " (this channel)" : ""}.` };
		}

		ignored.channels = remove(ignored.channels, channelId);
		writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignored, null, 4));

		return { text: `Unignoring channel ${channelId}.` };
	},
};