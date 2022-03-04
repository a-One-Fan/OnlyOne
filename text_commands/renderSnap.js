const { downloadImage, renderBlend, doFfmpeg, getResolution } = require("../extras/image_manip");
const { evenify, clamp } = require("../extras/mathStuff.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async execute(message, regexResults, extraRegex) {
		const [ impath, extension ] = await downloadImage(regexResults[2]);
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

		let aspectRatio = resolution[0] / resolution[1];
		aspectRatio = clamp(0.1, 10.0, aspectRatio);
		const targetArea = 600 * 600;
		let newWidth = Math.sqrt(targetArea / aspectRatio);
		let newHeight = newWidth * aspectRatio;
		[ newWidth, newHeight ] = evenify([newWidth, newHeight]);

		let bonusText = "Snapping that";
		let hasWith = false;

		let angle = 0;
		if (extraRegex[0]) {
			angle = parseFloat(extraRegex[0][1]);
			if (!regexResults[0][2]) angle = angle * (Math.PI / 180);
			bonusText += ` rotated ${angle} radians`;
		}

		let shape = "Tile";
		if (extraRegex[1] && ["Circle", "Hexagon", "Octagon", "One", "Triangle", "Tile"].find((str) => {return extraRegex[1][1] == str;})) {
			shape = extraRegex[1][1];
			bonusText += `, with ${shape}-shaped particles`;
			hasWith = true;
		}

		let distance = 3.0;
		if (extraRegex[2]) {
			distance = parseFloat(extraRegex[2][1]);
			distance = clamp(1, 25, distance);
			bonusText += `${hasWith ? " and " : ", with "}minimum particle distance ${distance}`;
			hasWith = true;
		}
		distance = distance * 0.01;

		let size = 1.0;
		if (extraRegex[3]) {
			size = parseFloat(extraRegex[3][1]);
			size = clamp(0.1, 20, size);
			bonusText += `${hasWith ? " and " : ", with "}particle size ${size}`;
			hasWith = true;
		}

		let color = "36393F";
		if (extraRegex[4]) {
			color = extraRegex[4][1];
			bonusText += `${hasWith ? " and " : ", with "}the background colored #${color}`;
			hasWith = true;
		}

		bonusText += "...";

		message.reply({ content: bonusText, allowedMentions: { repliedUser: false } });

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
#Function for conversion from linear to sRGB + mapping 255-0 to 1-0
def tolin(c):
	return pow((((c / 255.0) + 0.055)/1.055), 2.4)
(r, g, b) = map(tolin, bytes.fromhex("${color}"))
bpy.data.materials["Plane background"].node_tree.nodes["Emission"].inputs[0].default_value = (r, g, b, 1)
`;
		await renderBlend("extras/snapped.blend", ["-a"], pythonics);
		console.log("Rendered.");
		await doFfmpeg(["-i", "./tmp/snaprender.mp4", "-i", "./tmp/snapvid.mp4", "-map", "0:v", "-map", "1:a?", "-af", "afade=t=out:st=4:d=3.5", "-y", "./tmp/snapped.mp4"]);
		console.log("Audio merged.");
		const _file = new MessageAttachment("./tmp/snapped.mp4");
		return { text: ["Bye bye.", "It's no more.", "There it goes...", "Watch it vanish."][(Math.floor(Math.random() * 4))], files: [_file] };
	},
};