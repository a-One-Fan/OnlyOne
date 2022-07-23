// @ts-check
const https = require("https");
const fs = require("fs");
const { permittedUrls, downloadFilepath } = require("../config.json");

module.exports = {
	async getWebpage(address) {
		let resHtml = new Promise((resolve, reject) => {
			https.get(address, (res) => {
				let totalData = "";
				if (res.statusCode === 200) {
					res.on("data", (d) => {
						totalData += d;
					})
						.once("close", () => resolve(totalData));
				} else {
					reject(Error(`Request failed with status code: ${res.statusCode} while trying to get webpage`));
				}
			});
		});

		resHtml = await resHtml;

		return resHtml;
	},

	async getRedirect(address) {
		let resRedirect = new Promise((resolve, reject) => {
			https.get(address, (res) => {
				if (res.statusCode == 302) {
					resolve(res.headers.location);
				} else {
					reject(Error(`Request failed with status code: ${res.statusCode} while trying to get a redirect`));
				}
			});
		});

		resRedirect = await resRedirect;

		return resRedirect;
	},

	downloadImage(url, filepath = downloadFilepath) {
		return new Promise((resolve, reject) => {
			const regexResult = RegExp(permittedUrls).exec(url);
			if (!regexResult) {
				return reject(new Error("Bad URL: " + url));
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
};