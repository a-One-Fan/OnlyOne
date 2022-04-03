const { downloadImage, renderBlend, doFfmpeg, getResolution, toGoodVideo } = require("../extras/image_manip.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { evenify, clamp } = require("../extras/math_stuff.js");
const { MessageAttachment } = require("discord.js");
const { mkdirSync } = require("fs");

module.exports = {
	async execute(message, regexResults, extraRegex) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		const link = await getLinkFromText(regexResults[2], message);
		console.log("Working on snap...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/snapDownload`);
		console.log(`Snap took ${(new Date() - time) / 1000.0}s to download input.`);
		time = new Date();

		let resolution = await getResolution(impath + "." + extension);
		resolution = evenify(resolution);
		await toGoodVideo(impath + "." + extension, 30, `${uuid}/snapvid`, 7, resolution[0], resolution[1]);
		console.log(`Snap took ${(new Date() - time) / 1000.0}s to convert input.`);
		time = new Date();

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
bpy.data.images["snapvid"].filepath = "//../tmp/${uuid}/snapvid.mkv"
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
		await renderBlend("extras/snapped.blend", ["-o", `//../tmp/${uuid}/snaprender.mp4`, "-a"], pythonics);
		console.log(`Snap took ${(new Date() - time) / 1000.0}s to render.`);
		time = new Date();

		await doFfmpeg(["-i", `./tmp/${uuid}/snaprender.mp4`, "-i", `./tmp/${uuid}/snapvid.mkv`, "-map", "0:v", "-map", "1:a?", "-af", "afade=t=out:st=4:d=3.5", "-y", `./tmp/${uuid}snapped.mp4`]);
		console.log(`Snap took ${(new Date() - time) / 1000.0}s to merge audio.`);
		time = new Date();

		const _file = new MessageAttachment(`./tmp/${uuid}/snapped.mp4`);
		return { text: ["Bye bye.", "It's no more.", "There it goes...", "Watch it vanish."][(Math.floor(Math.random() * 4))], files: [_file], cleanup: `./tmp/${uuid}` };
	},
};