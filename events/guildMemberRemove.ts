const { userJoinChannelsFilepath } = require("../config.json");
const { readFileSync } = require("fs");

module.exports = {
	name: "guildMemberRemove",
	async execute(member) {
		const channels = JSON.parse(readFileSync(userJoinChannelsFilepath));

		const channelId = channels.servers[member.guild.id];

		console.log(`User left guild ${member.guild.id}, trying to post to channel ${channelId}`);

		if (channelId && !channelId.disabled) {
			const channel = member.client.channels.cache.get(channelId);
			if (channel) {
				channel.send(`<@${member.id}> ("${member.displayName}") has left us.`);
			}
		}
	},
};