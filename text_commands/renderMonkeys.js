const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[1]);
		console.log("impath, extension:", impath, extension);
		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", impath + ".png"]);
		await renderBlend("./extras/monkeys.blend");
		const _file = new MessageAttachment("./tmp/render0000.png");
		return { text: "Here's your render.", files: [_file] };
	},
};