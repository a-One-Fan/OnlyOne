const { downloadImage, renderBlend, doFfmpeg, getResolution, evenify, clamp } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[5]);
		console.log("impath, extension:", impath, extension);
		let resolution = await getResolution(impath + "." + extension);
		let vfscale = [];
		// fuk ur syntactic sugar i want it readable
		if (resolution != evenify(resolution)) {
			resolution = evenify(resolution);
			vfscale = ["-vf", `scale=${resolution[0]}:${resolution[1]}`];
		}
		await doFfmpeg(["-stream_loop", "-1", "-r", "30", "-i", impath + "." + extension, "-frames:v", "240", "-t", "8"].concat(vfscale).concat(["-y", "./tmp/snapvid.mp4"]));

		let angle = 0;
		if (regexResults[2]) {
			angle = parseFloat(regexResults[2]);
			if (!regexResults[3]) angle = angle * (Math.PI / 180);
		}

		let aspectRatio = resolution[0] / resolution[1];
		aspectRatio = clamp(0.2, 2.5, aspectRatio);
		const targetArea = 600 * 600;
		let newWidth = Math.sqrt(targetArea / aspectRatio);
		let newHeight = newWidth * aspectRatio;
		[ newWidth, newHeight ] = evenify([newWidth, newHeight]);

		let shape = regexResults[4];
		if (!shape || !["Circle", "Hexagon", "Octagon", "One", "Triangle"].find((str) => {return shape == str;})) {
			shape = "Tile";
		}

		const pythonics = `
import bpy
bpy.data.scenes["Scene"].render.resolution_x = ${newHeight}
bpy.data.scenes["Scene"].render.resolution_y = ${newWidth}
bpy.data.node_groups["Tile fadeout"].nodes["Rotation input"].outputs[0].default_value = ${angle}
bpy.ops.object.select_all(action='DESELECT')
bpy.data.objects["Image"].select_set(True)
bpy.ops.transform.resize(value=(${aspectRatio}, 1, 1), constraint_axis=(True, False, False))
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
bpy.data.node_groups["Tile fadeout"].nodes["Object Info"].inputs[0].default_value = bpy.data.objects['${shape}']
`;
		await renderBlend("extras/snapped.blend", ["-a"], pythonics);
		const _file = new MessageAttachment("./tmp/snaprender.mp4");
		return { text: "Here's your render.", files: [_file] };
	},
};