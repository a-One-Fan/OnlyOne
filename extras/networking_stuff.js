const https = require("https");

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
};