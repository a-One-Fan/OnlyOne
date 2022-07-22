const { userJoinChannelsFilepath } = require("../config.json");
const { downloadImage, renderBlend } = require("../extras/image_manip.js");
const { MessageAttachment } = require("discord.js");
const { mkdirSync, rm, readFileSync } = require("fs");
const { pickRandom } = require("../extras/math_stuff");

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

		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		const link = member.displayAvatarURL({ format: "png" });
		console.log("Welcoming new user...");
		let time = new Date();

		const [ , extension ] = await downloadImage(link, `./tmp/${uuid}/welcomeDownload`);
		console.log(`Welcome took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		const python = `import bpy\nbpy.data.images["PFP"].filepath = "//../tmp/${uuid}/welcomeDownload.${extension}"`;
		await renderBlend("./extras/welcome.blend", ["-S", pickRandom(["toaruWelcome", "utahimeWelcome"]), "-o", `//../tmp/${uuid}/welcomeResult####`, "-f", "0"], python);
		console.log(`Welcome took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		const file = new MessageAttachment(`./tmp/${uuid}/welcomeResult0000.png`);
		const text = `Welcome to the ${pickRandom(["not-Toaru", "not-Utahime", "One"])} server, <@${member.id}>!`;
		await channel.send({ content: text, files: [file] });

		rm(`./tmp/${uuid}`, { recursive: true, force: true }, (err) => { if (err) console.log("Got error while deleting:", err); });
	},
};