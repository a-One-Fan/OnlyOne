const fs = require("fs");
const https = require("https");
const { validURLs } = require("../config.json");

module.exports = {
	downloadImage(url, filepath) {
		// What the shit? Who even wrote the original?
		// https://scrapingant.com/blog/download-image-javascript
		// https://lzomedia.com/blog/how-to-download-images-with-nodejs/
		// https://www.scien.cx/2021/08/26/how-to-download-images-with-nodejs/
		// https://gist.github.com/kamal-hossain/5b50b01ac141301cebbaf3ce424b9ec9
		// Should a code tidbit this small even get attributed to one single person?
		return new Promise((resolve, reject) => {
			if (!RegExp(validURLs).test(url)) {
				return 1;
			}
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