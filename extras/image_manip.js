const fs = require("fs");
const https = require("https");
const { execFile } = require("child_process");
const { blenderLocation, ffmpegLocation, permittedUrls, downloadFilepath } = require("../config.json");

module.exports = {
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
	renderBlend(filepath, extension = "png", outpath = "//../tmp/render", pythonics = "pass") {
		return new Promise((resolve, reject) => {
			const cp = execFile(blenderLocation, ["-b", filepath, "--python-expr", pythonics, "-f", "0", "-F", extension, "-o", outpath + "." + extension], (error, stdout, stderr) => {
				if (error) {
					reject(`Error when rendering!\nError:\n${error}\nstdout:\n${stdout}\nstderr:\n${stderr}`);
				}
			});
			cp.on("error", (err) => reject(err))
				.once("close", (code) => resolve(code));
		});
	},
	doFfmpeg(args) {
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
};