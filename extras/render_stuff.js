const { mkdirSync } = require("fs");
const { downloadImage } = require("./networking_stuff.js");
const { doFfmpeg, renderBlend, toGoodVideo, getResolution } = require("./image_manip.js");
const { evenify, clamp, find, pickRandom } = require("../extras/math_stuff.js");
const { MessageAttachment } = require("discord.js");

module.exports = {
	async renderMonkeys(link, doLog = true) {
		if (doLog) console.log("Working on monkeys...");

		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		let time = new Date();
		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/monkeyDownload`);
		if (doLog) {
			console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to download input.`);
			time = new Date();
		}

		await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", `./tmp/${uuid}/monkeyStuff.png`]);
		if (doLog) {
			console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to convert input.`);
			time = new Date();
		}

		const pythonics =
`
import bpy
bpy.data.images["monkeyStuff.png"].filepath = "//../tmp/${uuid}/monkeyStuff.png"
`;
		await renderBlend("./extras/monkeys.blend", ["-o", `//../tmp/${uuid}/monkeyPic####`, "-f", "0"], pythonics);
		if (doLog) {
			console.log(`Monkeys took ${(new Date() - time) / 1000.0}s to render.`);
			time = new Date();
		}

		const _file = new MessageAttachment(`./tmp/${uuid}/monkeyPic0000.png`);
		return { files: [_file], cleanup: `./tmp/${uuid}` };
	},


	async renderBarrel(link, doLog = true) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		if (doLog) console.log("Working on barrel...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/barrelDownload`);
		if (doLog) {
			console.log(`Barrel took ${(new Date() - time) / 1000.0}s to download input.`);
			time = new Date();
		}

		await toGoodVideo(impath + "." + extension, 25, `${uuid}/barrelPicture`, 2.5);
		if (doLog) {
			console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert input to video.`);
			time = new Date();
		}

		const pythonics =
`
import bpy
bpy.data.images["barrelPicture"].filepath = "//../tmp/${uuid}/barrelPicture.mkv"
`;
		await renderBlend("./extras/barrel.blend", ["-o", `//../tmp/${uuid}/barrelResult.mkv`, "-a"], pythonics);
		if (doLog) {
			console.log(`Barrel took ${(new Date() - time) / 1000.0}s to render.`);
			time = new Date();
		}

		await doFfmpeg(["-i", `./tmp/${uuid}/barrelResult.mkv`, "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", `./tmp/${uuid}/barrelRoll.gif`]);
		if (doLog) console.log(`Barrel took ${(new Date() - time) / 1000.0}s to convert output to gif.`);

		const _file = new MessageAttachment(`./tmp/${uuid}/barrelRoll.gif`);
		return { files: [_file], cleanup: `./tmp/${uuid}` };
	},


	async renderSnap(link, renderParams, messageToReply = undefined, replyPayload = { content: "Working on snap..." }, doLog = true) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		if (doLog) console.log("Working on snap...");
		let time = new Date();

		const [ impath, extension ] = await downloadImage(link, `./tmp/${uuid}/snapDownload`);
		if (doLog) {
			console.log(`Snap took ${(new Date() - time) / 1000.0}s to download input.`);
			time = new Date();
		}

		let resolution = await getResolution(impath + "." + extension);
		resolution = evenify(resolution);
		await toGoodVideo(impath + "." + extension, 30, `${uuid}/snapvid`, 7, resolution[0], resolution[1]);
		if (doLog) {
			console.log(`Snap took ${(new Date() - time) / 1000.0}s to convert input.`);
			time = new Date();
		}

		let aspectRatio = resolution[0] / resolution[1];
		aspectRatio = clamp(0.1, 10.0, aspectRatio);
		const targetArea = 600 * 600;
		let newWidth = Math.sqrt(targetArea / aspectRatio);
		let newHeight = newWidth * aspectRatio;
		[ newWidth, newHeight ] = evenify([newWidth, newHeight]);

		let angle = 0;
		if (renderParams.angle) angle = renderParams.angle;

		let shape = "Tile";
		if (renderParams.shape) shape = renderParams.shape;

		let distance = 3.0 * 0.01;
		if (renderParams.distance) distance = renderParams.distance;

		let size = 1.0;
		if (renderParams.size) size = renderParams.size;

		let color = "36393F";
		if (renderParams.color) color = renderParams.color;

		if (messageToReply) {
			messageToReply.reply(replyPayload);
		}

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
		if (doLog) {
			console.log(`Snap took ${(new Date() - time) / 1000.0}s to render.`);
			time = new Date();
		}

		await doFfmpeg(["-i", `./tmp/${uuid}/snaprender.mp4`, "-i", `./tmp/${uuid}/snapvid.mkv`, "-map", "0:v", "-map", "1:a?", "-af", "afade=t=out:st=4:d=3.5", "-y", `./tmp/${uuid}/snapped.mp4`]);
		if (doLog) {
			console.log(`Snap took ${(new Date() - time) / 1000.0}s to merge audio.`);
			time = new Date();
		}

		const _file = new MessageAttachment(`./tmp/${uuid}/snapped.mp4`);
		return { files: [_file], cleanup: `./tmp/${uuid}` };
	},

	async renderWelcome(link, renderParams, doLog = true) {
		const uuid = Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
		mkdirSync(`./tmp/${uuid}`);

		if (doLog) console.log("Welcoming new user...");
		let time = new Date();

		const [ , extension ] = await downloadImage(link, `./tmp/${uuid}/welcomeDownload`);
		if (doLog) {
			console.log(`Welcome took ${(new Date() - time) / 1000.0}s to download input.`);
			time = new Date();
		}

		let userMention = "You forgot to add a mention!!!";
		if (renderParams.userMention) userMention = renderParams.userMention;

		let hideText = false;
		if (renderParams.hideText) hideText = true;

		const python =
`
import bpy
bpy.data.images["PFP"].filepath = "//../tmp/${uuid}/welcomeDownload.${extension}"
bpy.data.curves["UserMention"].body = "${userMention}"
if ${hideText ? "True" : "False"}:
	for c in bpy.data.collections:
		if "text" in c.name:
			c.hide_render = True
`;
		const SCENES = ["toaruWelcome", "toaruWelcome2", "toaruWelcome3", "utahimeWelcome", "utahimeWelcome2"];
		if (!renderParams.scene || (find(SCENES, renderParams.scene) < 0)) {
			renderParams.scene = pickRandom(SCENES);
		}
		await renderBlend("./extras/welcome.blend", ["-S", renderParams.scene, "-o", `//../tmp/${uuid}/welcomeResult####`, "-f", "0"], python);
		if (doLog) {
			console.log(`Welcome took ${(new Date() - time) / 1000.0}s to render.`);
			time = new Date();
		}

		const _file = new MessageAttachment(`./tmp/${uuid}/welcomeResult0000.png`);

		return { files: [_file], cleanup: `./tmp/${uuid}` };
	},
};