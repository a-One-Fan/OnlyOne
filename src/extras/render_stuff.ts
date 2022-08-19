import { mkdirSync } from "fs";
import { downloadImage } from "./networking_stuff";
import { doFfmpeg, renderBlend, toGoodVideo, getResolution } from "./image_manip";
import { evenify, clamp, find, pickRandom } from "../extras/math_stuff";
import { MessageAttachment } from "discord.js";
import { TextCommandResult } from "../text_commands/_commands";

function gett(ref: Date) {
	return ((new Date()).getTime() - ref.getTime()) / 1000.0;
}

function makeuuid() {
	return Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
}

export const TMPDIR = "./tmp/";
const BLEND_TO_TMPDIR = "//../tmp/"
const BLENDSDIR = "./blends"

async function renderMonkeys(link: string, doLog = true): Promise<TextCommandResult> {
	if (doLog) console.log("Working on monkeys...");

	const uuid = makeuuid();
	const dir = TMPDIR + uuid;
	const dir_blend = BLEND_TO_TMPDIR + uuid;
	mkdirSync(dir);

	let time = new Date();
	const [ impath, extension ] = await downloadImage(link, `${dir}/monkeyDownload`);
	if (doLog) {
		console.log(`Monkeys took ${gett(time)}s to download input (${link} -> ${impath}.${extension}).`);
		time = new Date();
	}

	await doFfmpeg(["-i", impath + "." + extension, "-frames:v", "1", "-y", `${dir}/monkeyStuff.png`]);
	if (doLog) {
		console.log(`Monkeys took ${gett(time)}s to convert input.`);
		time = new Date();
	}

	const pythonics =
`
import bpy
bpy.data.images["monkeyStuff.png"].filepath = "${dir_blend}/monkeyStuff.png"
`;
	await renderBlend(`${BLENDSDIR}/monkeys.blend`, ["-o", `${dir_blend}/monkeyPic####`, "-f", "0"], pythonics);
	if (doLog) {
		console.log(`Monkeys took ${gett(time)}s to render.`);
		time = new Date();
	}

	const _file = new MessageAttachment(`${dir}/monkeyPic0000.png`);
	return { files: [_file], cleanup: [`${dir}`] };
}


async function renderBarrel(link: string, doLog = true): Promise<TextCommandResult> {
	const uuid = makeuuid();
	const dir = TMPDIR + uuid;
	const dir_blend = BLEND_TO_TMPDIR + uuid;
	mkdirSync(dir);

	if (doLog) console.log("Working on barrel...");
	let time = new Date();

	const [ impath, extension ] = await downloadImage(link, `${dir}/barrelDownload`);
	if (doLog) {
		console.log(`Barrel took ${gett(time)}s to download input (${link} -> ${impath}.${extension}).`);
		time = new Date();
	}

	await toGoodVideo(impath + "." + extension, 25, `${dir}/barrelPicture`, 2.5);
	if (doLog) {
		console.log(`Barrel took ${gett(time)}s to convert input to video.`);
		time = new Date();
	}

	const pythonics =
`
import bpy
bpy.data.images["barrelPicture"].filepath = "${dir_blend}/barrelPicture.mkv"
`;
	await renderBlend(`${BLENDSDIR}/barrel.blend`, ["-o", `${dir_blend}/barrelResult.mkv`, "-a"], pythonics);
	if (doLog) {
		console.log(`Barrel took ${gett(time)}s to render.`);
		time = new Date();
	}

	await doFfmpeg(["-i", `${dir}/barrelResult.mkv`, "-lavfi", "[0:v]palettegen[pal]; [0:v][pal]paletteuse", "-y", `${dir}/barrelRoll.gif`]);
	if (doLog) console.log(`Barrel took ${gett(time)}s to convert output to gif.`);

	const _file = new MessageAttachment(`${dir}/barrelRoll.gif`);
	return { files: [_file], cleanup: [dir] };
}

export interface SnapParams {
	angle?: number,
	shape?: string,
	distance?: number,
	size?: number,
	color?: string
}
async function renderSnap(link: string, renderParams: SnapParams, messageToReply: any | undefined = undefined, 
	replyPayload = { content: "Working on snap..." }, doLog = true): Promise<TextCommandResult> {
	const uuid = makeuuid();
	const dir = TMPDIR + uuid;
	const dir_blend = BLEND_TO_TMPDIR + uuid;
	mkdirSync(dir);

	if (doLog) console.log("Working on snap...");
	let time = new Date();

	const [ impath, extension ] = await downloadImage(link, `${dir}/snapDownload`);
	if (doLog) {
		console.log(`Snap took ${gett(time)}s to download input (${link} -> ${impath}.${extension}).`);
		time = new Date();
	}

	let resolution = await getResolution(impath + "." + extension);
	resolution = evenify(resolution);
	await toGoodVideo(impath + "." + extension, 30, `${dir}/snapvid`, 9, resolution[0], resolution[1]);
	if (doLog) {
		console.log(`Snap took ${gett(time)}s to convert input.`);
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
bpy.data.images["snapvid"].filepath = "${dir_blend}/snapvid.mkv"
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
	await renderBlend(`${BLENDSDIR}/snapped.blend`, ["-o", `${dir_blend}/snaprender.mp4`, "-a"], pythonics);
	if (doLog) {
		console.log(`Snap took ${gett(time)}s to render.`);
		time = new Date();
	}

	await doFfmpeg(["-i", `${dir}/snaprender.mp4`, "-i", `${dir}/snapvid.mkv`, "-map", "0:v", "-map", "1:a?", "-af", "afade=t=out:st=4.8:d=3.5", "-y", `${dir}/snapped.mp4`]);
	if (doLog) {
		console.log(`Snap took ${gett(time)}s to merge audio.`);
		time = new Date();
	}

	const _file = new MessageAttachment(`${dir}/snapped.mp4`);
	return { files: [_file], cleanup: [`${dir}`] };
}

const WELCOME_SCENES = ["toaruWelcome", "toaruWelcome2", "toaruWelcome3", "utahimeWelcome", "utahimeWelcome2"];
export interface WelcomeParams {
	userMention?: string,
	hideText?: boolean,
	scene?: string
}
async function renderWelcome(link: string, renderParams: WelcomeParams, doLog = true): Promise<TextCommandResult> {
	const uuid = makeuuid();
	const dir = TMPDIR + uuid;
	const dir_blend = BLEND_TO_TMPDIR + uuid;
	mkdirSync(dir);

	if (doLog) console.log("Welcoming new user...");
	let time = new Date();

	const [impath , extension ] = await downloadImage(link, `${dir}/welcomeDownload`);
	if (doLog) {
		console.log(`Welcome took ${gett(time)}s to download input (${link} -> ${impath}.${extension})`);
		time = new Date();
	}

	let userMention = "You forgot to add a mention!!!";
	if (renderParams.userMention) userMention = renderParams.userMention;

	let hideText = false;
	if (renderParams.hideText) hideText = true;
	const python =
`
import bpy
bpy.data.images["PFP"].filepath = "${dir_blend}/welcomeDownload.${extension}"
bpy.data.curves["UserMention"].body = "${userMention}"
if ${hideText ? "True" : "False"}:
	for c in bpy.data.collections:
		if "text" in c.name:
			c.hide_render = True
`;
	if (!renderParams.scene || (find(WELCOME_SCENES, renderParams.scene) < 0)) {
		renderParams.scene = pickRandom(WELCOME_SCENES);
	}
	await renderBlend(`${BLENDSDIR}/welcome.blend`, ["-S", renderParams.scene as unknown as string, "-o", `${dir_blend}/welcomeResult####`, "-f", "0"], python);
	if (doLog) {
		console.log(`Welcome took ${gett(time)}s to render.`);
		time = new Date();
	}

	const _file = new MessageAttachment(`${dir}/welcomeResult0000.png`);

	return { files: [_file], cleanup: [`${dir}`] };
}



export { renderMonkeys, renderBarrel, renderSnap, renderWelcome };