const { downloadImage, renderBlend, doFfmpeg } = require("../extras/image_manip");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");
const { mkdirSync } = require("fs");

module.exports = {
	async execute(message, regexResults) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		const link = await getLinkFromText(regexResults[1], message);
		console.log("Working on monkeys...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/monkeyDownload`);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", `./tmp/${uuid}/monkeyStuff.png`]);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to convert input.`);
		time = new Date();

		await renderBlend("./extras/monkeys.blend", ["-o", `//../tmp/${uuid}/monkeyPic####`, "-f", "0"], `import bpy\nbpy.data.images["monkeyStuff.png"].filepath = "//../tmp/${uuid}/monkeyStuff.png"`);
		console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		const _file = new MessageAttachment(`./tmp/${uuid}/monkeyPic0000.png`);
		return { text: "Here's your render.", files: [_file], cleanup: `./tmp/${uuid}` };
	},
};