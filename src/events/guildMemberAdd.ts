import { userJoinChannelsFilepath } from "../config.json";
import { renderWelcome } from "../extras/render_stuff";
import { pickRandom } from "../extras/math_stuff";
import { rm, readFileSync } from "fs";
import { cleanup } from "../extras/file_stuff";

const name = "guildMemberAdd";

async function execute(member: any) {
	const channels = JSON.parse(readFileSync(userJoinChannelsFilepath).toString());

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

	cleanup(renderResult.cleanup);
}

export { name, execute };