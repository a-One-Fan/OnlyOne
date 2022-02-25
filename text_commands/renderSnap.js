const { downloadImage, renderBlend, doFfmpeg, getResolution, evenify, clamp } = require("../extras/image_manip");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults) {
		const [ impath, extension ] = await downloadImage(regexResults[7]);
		console.log("Downloaded file.");
		let resolution = await getResolution(impath + "." + extension);
		let vfscale = [];
		// fuk ur syntactic sugar i want it readable
		if (resolution != evenify(resolution)) {
			resolution = evenify(resolution);
			vfscale = ["-vf", `scale=${resolution[0]}:${resolution[1]}`];
		}
		await doFfmpeg(["-stream_loop", "-1", "-i", impath + "." + extension, "-vf", "fps=fps=30", "-t", "8"].concat(vfscale).concat(["-y", "./tmp/snapvid.mp4"]));
		console.log("Converted to good video.");
		let angle = 0;
		if (regexResults[2]) {
			angle = parseFloat(regexResults[2]);
			if (!regexResults[3]) angle = angle * (Math.PI / 180);
		}

		let aspectRatio = resolution[0] / resolution[1];
		aspectRatio = clamp(0.2, 5.0, aspectRatio);
		const targetArea = 600 * 600;
		let newWidth = Math.sqrt(targetArea / aspectRatio);
		let newHeight = newWidth * aspectRatio;
		[ newWidth, newHeight ] = evenify([newWidth, newHeight]);

		let shape = regexResults[4];
		if (!shape || !["Circle", "Hexagon", "Octagon", "One", "Triangle"].find((str) => {return shape == str;})) {
			shape = "Tile";
		}

		let distance = 3.0;
		if (regexResults[5]) {
			distance = parseFloat(regexResults[5]);
			distance = clamp(1, 25, distance);
		}
		distance = distance * 0.01;

		let size = 1.0;
		if (regexResults[6]) {
			size = parseFloat(regexResults[6]);
			size = clamp(0.1, 20, size);
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
bpy.data.node_groups["Tile fadeout"].nodes["Distribution distance"].outputs[0].default_value = ${distance}
bpy.data.node_groups["Tile fadeout"].nodes["Size modifier"].outputs[0].default_value = ${size}
`;
		await renderBlend("extras/snapped.blend", ["-a"], pythonics);
		console.log("Rendered.");
		await doFfmpeg(["-i", "./tmp/snaprender.mp4", "-i", "./tmp/snapvid.mp4", "-map", "0:v", "-map", "1:a?", "-af", "afade=t=out:st=4:d=3.5", "-y", "./tmp/snapped.mp4"]);
		console.log("Audio merged.");
		const _file = new MessageAttachment("./tmp/snapped.mp4");
		return { text: ["Bye bye.", "It's no more.", "There it goes...", "Watch it vanish."][(Math.floor(Math.random() * 4))], files: [_file] };
	},
};