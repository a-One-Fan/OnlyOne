const { userJoinChannelsFilepath } = require("../config.json");
const { renderWelcome } = require("../extras/render_stuff.js");
const { pickRandom } = require("../extras/math_stuff");
const { rm, readFileSync } = require("fs");

module.exports = {
	name: "guildMemberAdd",
	async execute(member) {
		const channels = JSON.parse(readFileSync(userJoinChannelsFilepath));

		const channelId = channels.servers[member.guild.id];

		let channel = undefined;

		if (channelId && !channelId.disabled) {
			channel = member.client.channels.cache.get(channelId);
			if (!channel) {
				return;
			}
		} else {
			return;
		}

		const link = member.displayAvatarURL({ format: "png" });

		const renderResult = await renderWelcome(link, { userMention: `@${member.displayName}` });
		const text = `Welcome to the ${pickRandom(["not-Toaru", "not-quite-Utahime", "One", "not-Railgun", "not-Raildex", "OnlyOne"])} server, <@${member.id}>!`;
		await channel.send({ content: text, files: renderResult.files });

		rm(renderResult.cleanup, { recursive: true, force: true }, (err) => { if (err) console.log("Got error while deleting:", err); });
	},
};