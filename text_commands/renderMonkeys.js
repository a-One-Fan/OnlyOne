const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const link = await getLinkFromText(regexResults[1], message);
		const [ impath, extension ] = await downloadImage(link);
		console.log("impath, extension:", impath, extension);
		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", "./tmp/monkeyStuff.png"]);
		await renderBlend("./extras/monkeys.blend", ["-f", "0"]);
		const _file = new MessageAttachment("./tmp/monkeyPic0000.png");
		return { text: "Here's your render.", files: [_file] };
	},
};