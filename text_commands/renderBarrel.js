const { downloadImage, renderBlend, doFfmpeg, toGoodVideo } = require("../extras/image_manip.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");
const { mkdirSync } = require("fs");

module.exports = {
	async execute(message, regexResults) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		const link = await getLinkFromText(regexResults[1], message);
		console.log("Working on barrel...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/barrelDownload`);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		await toGoodVideo(impath + "." + extension, 25, `${uuid}/barrelPicture`, 2.5);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert input to video.`);
		time = new Date();

		await renderBlend("./extras/barrel.blend", ["-o", `//../tmp/${uuid}/barrelResult.mkv`, "-a"], `import bpy\nbpy.data.images["barrelPicture"].filepath = "//../tmp/${uuid}/barrelPicture.mkv"`);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		await doFfmpeg(["-i", `./tmp/${uuid}/barrelResult.mkv`, "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", `./tmp/${uuid}/barrelRoll.gif`]);
		console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert output to gif.`);

		const _file = new MessageAttachment(`./tmp/${uuid}/barrelRoll.gif`);
		return { text: "Rolling...", files: [_file], cleanup: `./tmp/${uuid}` };
	},
};