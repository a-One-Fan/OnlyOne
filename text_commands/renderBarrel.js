const { downloadImage, renderBlend, doFfmpeg, toGoodVideo } = require("../extras/image_manip.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const link = await getLinkFromText(regexResults[1], message);
		console.log("Working on barrel...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		await toGoodVideo(impath + "." + extension, 25, "barrelPicture", 2.5);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert input to video.`);
		time = new Date();

		await renderBlend("./extras/barrel.blend", ["-a"]);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		await doFfmpeg(["-i", "./tmp/barrelResult.mkv", "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", "./tmp/barrelRoll.gif"]);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert output to gif.`);

		const _file = new MessageAttachment("./tmp/barrelRoll.gif");
		return { text: "Rolling...", files: [_file] };
	},
};