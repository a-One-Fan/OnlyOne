const { downloadImage, renderBlend, doFfmpeg, getResolution } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[2]);
		console.log("impath, extension:", impath, extension);
		const originalRes = await getResolution(impath + "." + extension);
		let vfscale = [];
		// fuk ur syntactic sugar i want it readable
		if (originalRes[0] % 2 == 1 || originalRes[0] % 2 == 1) vfscale = ["-vf", `scale=${originalRes[0] + originalRes[0] % 2}:${originalRes[1] + originalRes[1] % 2}`];
		console.log("res, scale:", vfscale, originalRes);
		await doFfmpeg(["-stream_loop", "-1", "-r", "30", "-i", impath + "." + extension, "-frames:v", "240", "-t", "8"].concat(vfscale).concat(["-y", "./tmp/snapvid.mp4"]));

		await renderBlend("extras/snapped.blend", ["-a"]);
		const _file = new MessageAttachment("./tmp/snaprender.mp4");
		return { text: "Here's your render.", files: [_file] };
	},
};