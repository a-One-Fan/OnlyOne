import { execFile } from "child_process";
const { blenderLocation, ffmpegFolderLocation } = require("../config.json");

// TODO: no .on("error") if we already have if (error) ?
// Automatically renders borderless.
function renderBlend(filepath: string, args: string[], pythonics = "pass") {
	return new Promise((resolve, reject) => {
		const args_combined = ["-b", filepath, "--python-expr", pythonics].concat(args);
		const cp = execFile(blenderLocation, args_combined, (error, stdout, stderr) => {
			if (stderr) console.log(stderr);
			if (error) {
				reject(`Error when rendering!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
			}
		});
		cp.on("error", (err) => reject(err))
			.once("close", (code) => resolve(code));
	});
}
function doFfmpeg(args: string[]) {
	const ffmpegLocation = ffmpegFolderLocation + "ffmpeg.exe";
	return new Promise((resolve, reject) => {
		const cp = execFile(ffmpegLocation, ["-hide_banner"].concat(args), (error, stdout, stderr) => {
			// if (stderr) console.log(stderr);
			if (error) {
				reject(`Error when using ffmpeg!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
			}
		});
		cp.on("error", (err) => reject(err))
			.once("close", (code) => resolve(code));
	});
}
// Automatically saves converted video to tmp folder.
// Converted video title should be extensionless!!!
async function toGoodVideo(file: string, fps: number, outname: string, length: number, resolution_x?: number, resolution_y?: number) {
	let lavfi = "";
	if (!resolution_x) {
		lavfi = `[0:v]fps=fps=${fps}`;
	} else {
		lavfi = `[0:v]scale=${resolution_x}:${resolution_y}[scaled], [scaled]fps=fps=${fps}`;
	}
	const args = ["-stream_loop", "-1", "-i", file, "-lavfi", lavfi, "-t", length, "-c:v", "ffv1", "-y", "./tmp/" + outname + ".mkv"];
	await module.exports.doFfmpeg(args);
}
function getResolution(filepath: string): Promise<[number, number]> {
	const ffprobeLocation = ffmpegFolderLocation + "ffprobe.exe";
	return new Promise((resolve, reject) => {
		let res = "";
		const cp = execFile(ffprobeLocation, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "default=nw=1:nk=1", filepath], (error, stdout, stderr) => {
		// if (stderr) console.log(stderr);
		if (error) reject(`Error when using ffprobe!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);

		res = stdout;
		});
		cp.once("close", (code) => {
			const res_split = res.split("\n");
			resolve([parseInt(res_split[0]), parseInt(res_split[1])]);
		});
	});
}

export { renderBlend, doFfmpeg, toGoodVideo, getResolution };