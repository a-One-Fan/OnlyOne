const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		let targetUser = message.client.user;
		if (regexResults[1]) targetUser = message.author;
		if (regexResults[2]) {
			targetUser = await message.client.users.fetch(regexResults[2]);
			if (!targetUser) throw Error("Printable error: Sorry, I couldn't find a user by that ID.");
		}
		if (regexResults[3]) {
			targetUser = await message.client.users.cache.find((u) => (u.tag.search(regexResults[3]) != -1));
			if (!targetUser) throw Error("Printable error: Sorry, I couldn't find a user by that name.");
		}
		const [ impath, extension ] = await downloadImage(targetUser.displayAvatarURL({ format: "png" }));
		await doFfmpeg(["-i", impath + "." + extension, "-y", "./tmp/barrelPicture.png"]);
		await renderBlend("./extras/barrel.blend", ["-a"]);
		await doFfmpeg(["-i", "./tmp/barrelResult.mkv", "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", "./tmp/barrelRoll.gif"]);
		const _file = new MessageAttachment("./tmp/barrelRoll.gif");
		return { text: "Rolling...", files: [_file] };
	},
};