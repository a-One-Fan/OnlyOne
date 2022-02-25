const fs = require("fs");
const https = require("https");
const { execFile } = require("child_process");
const { blenderLocation, ffmpegFolderLocation, permittedUrls, downloadFilepath } = require("../config.json");

module.exports = {
	// Make resolution even so that h264 can properly encode.
	evenify(resolution) {
		return [resolution[0] + resolution[0] % 2, resolution[1] + resolution[1] % 2];
	},
	downloadImage(url, filepath = downloadFilepath) {
		return new Promise((resolve, reject) => {
			const regexResult = RegExp(permittedUrls).exec(url);
			if (!regexResult) {
				return reject(new Error("Bad URL"));
			}
			const extensionlessPath = filepath;
			filepath = filepath + "." + regexResult[1];
			https.get(url, (msg) => {
				if (msg.statusCode === 200) {
					msg.pipe(fs.createWriteStream(filepath))
						.on("error", reject)
						.once("close", () => resolve([extensionlessPath, regexResult[1]]));
				} else {
					msg.resume();
					reject(new Error(`Request failed with status code: ${msg.statusCode}`));
				}
			});
		});
	},
	// TODO: no .on("error") if we already have if (error) ?
	renderBlend(filepath, args, pythonics = "pass") {
		return new Promise((resolve, reject) => {
			const cp = execFile(blenderLocation, ["-b", filepath, "--python-expr", pythonics].concat(args), (error, stdout, stderr) => {
				if (error) {
					reject(`Error when rendering!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
				}
			});
			cp.on("error", (err) => reject(err))
				.once("close", (code) => resolve(code));
		});
	},
	doFfmpeg(args) {
		const ffmpegLocation = ffmpegFolderLocation + "ffmpeg.exe";
		return new Promise((resolve, reject) => {
			const cp = execFile(ffmpegLocation, ["-hide_banner"].concat(args), (error, stdout, stderr) => {
				if (error) {
					reject(`Error when using ffmpeg!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
				}
			});
			cp.on("error", (err) => reject(err))
				.once("close", (code) => resolve(code));
		});
	},
	getResolution(filepath) {
		const ffprobeLocation = ffmpegFolderLocation + "ffprobe.exe";
		return new Promise((resolve, reject) => {
			let res = "";
			const cp = execFile(ffprobeLocation, ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "default=nw=1:nk=1", filepath], (error, stdout, stderr) => {

				if (error) reject(`Error when using ffprobe!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);

				res = stdout;
			});
			cp.once("close", (code) => {
				res = res.split("\n");
				res = [parseInt(res[0]), parseInt(res[1])];
				resolve(res);
			});
		});
	},
};