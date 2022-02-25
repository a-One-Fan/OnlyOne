const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[1]);
		console.log("impath, extension:", impath, extension);
		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", "./tmp/monkeyStuff.png"]);
		await renderBlend("./extras/monkeys.blend", ["-f", "0"]);
		const _file = new MessageAttachment("./tmp/monkeyPic0000.png");
		return { text: "Here's your render.", files: [_file] };
	},
};