const { downloadImage, renderBlend } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		await downloadImage(regexResults[1]);
		await renderBlend("./extras/monkeys.blend");
		const _file = new MessageAttachment("./tmp/render0000.png");
		return { text: "Here's your render.", files: [_file] };
	},
};