const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const link = await getLinkFromText(regexResults[1], message);
		console.log("Working on monkeys...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", "./tmp/monkeyStuff.png"]);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to convert input.`);
		time = new Date();

		await renderBlend("./extras/monkeys.blend", ["-f", "0"]);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		const _file = new MessageAttachment("./tmp/monkeyPic0000.png");
		return { text: "Here's your render.", files: [_file] };
	},
};