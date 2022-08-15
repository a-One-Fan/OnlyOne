import { userJoinChannelsFilepath } from "../config.json";
import { readFileSync } from "fs";

const name = "guildMemberRemove";
async function execute(member: any) {
	const channels = JSON.parse(readFileSync(userJoinChannelsFilepath).toString());

	const channelId = channels.servers[member.guild.id];

	console.log(`User left guild ${member.guild.id}, trying to post to channel ${channelId}`);

	if (channelId && !channelId.disabled) {
		const channel = member.client.channels.cache.get(channelId);
		if (channel) {
			channel.send(`<@${member.id}> ("${member.displayName}") has left us.`);
		}
	}
}

export { name, execute }