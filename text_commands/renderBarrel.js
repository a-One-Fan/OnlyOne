const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		let targetUser = message.client.user;
		if (regexResults[3]) targetUser = message.user;
		if (regexResults[2]) {
			const found = message.client.users.cache.find(u => u.id == regexResults[2]);
			if (!found) throw Error("Printable error: Sorry, I couldn't find a user by that ID.");
			targetUser = found;
		}
		if (regexResults[1]) {
			const lower = regexResults[1].toLowerCase();
			const found = message.client.users.cache.find(u => u.username.toLowerCase().search(lower) != -1);
			if (!found) throw Error("Printable error: Sorry, I couldn't find a user by that name.");
			targetUser = found;
		}
		const [ impath, extension ] = await downloadImage(targetUser.displayAvatarURL({ format: "png" }));
		console.log("impath, extension:", impath, extension);
		await doFfmpeg(["-i", impath + "." + extension, "-y", "./tmp/barrelPicture.png"]);
		await renderBlend("./extras/barrel.blend", ["-a"]);
		await doFfmpeg(["-i", "barrelResult.mkv", "-lavfi", "\"[0:v]palettegen[pal]; [0:v][pal]paletteuse\"", "-y", "barrelRoll.gif"]);
		const _file = new MessageAttachment("./tmp/barrelRoll.gif");
		return { text: "Rolling...", files: [_file] };
	},
};