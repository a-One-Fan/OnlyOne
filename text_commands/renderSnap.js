const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[2]);
		console.log("impath, extension:", impath, extension);
		await doFfmpeg(["-stream_loop", "-1", "-r", "30", "-i", impath + "." + extension, "-frames:v", "240", "-t", "8", "-y", "./tmp/snapvid.mp4"]);

		await renderBlend("./extras/snapped.blend");
		const _file = new MessageAttachment("./tmp/snaprender.mp4");
		return { text: "Here's your render.", files: [_file] };
	},
};