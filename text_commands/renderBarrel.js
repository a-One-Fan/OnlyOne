const { downloadImage, renderBlend, doFfmpeg, toGoodVideo } = require("../extras/image_manip.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const link = await getLinkFromText(regexResults[1], message);
		const [ impath, extension ] = await downloadImage(link);
		await toGoodVideo(impath + "." + extension, 25, "barrelPicture");
		await renderBlend("./extras/barrel.blend", ["-a"]);
		await doFfmpeg(["-i", "./tmp/barrelResult.mkv", "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", "./tmp/barrelRoll.gif"]);
		const _file = new MessageAttachment("./tmp/barrelRoll.gif");
		return { text: "Rolling...", files: [_file] };
	},
};