const fs = require("fs");
const https = require("https");
const { permittedUrls } = require("../config.json");

module.exports = {
	downloadImage(url, filepath) {
		return new Promise((resolve, reject) => {
			const regexResult = RegExp(permittedUrls).exec(url);
			if (!regexResult) {
				return reject(new Error("Bad URL"));
			}
			filepath = filepath + "." + regexResult[1];
			https.get(url, (msg) => {
				if (msg.statusCode === 200) {
					msg.pipe(fs.createWriteStream(filepath))
						.on("error", reject)
						.once("close", () => resolve(filepath));
				} else {
					msg.resume();
					reject(new Error(`Request failed with status code: ${msg.statusCode}`));
				}
			});
		});
	},
};