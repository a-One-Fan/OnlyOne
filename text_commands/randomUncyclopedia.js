const https = require("https");

// TODO: move this and the other one into their own file in extras/ for networking
async function getRedirect(address) {
	let resRedirect = new Promise((resolve, reject) => {
		https.get(address, (res) => {
			if (res.statusCode == 302) {
				resolve(res.headers.location);
			} else {
				reject(Error(`Request failed with status code: ${res.statusCode}`));
			}
		});
	});

	resRedirect = await resRedirect;

	return resRedirect;
}

module.exports = {
	async execute(message, regexResults, extraRegex) {

		const resRedirect = await getRedirect("https://en.uncyclopedia.co/wiki/Special:RandomRootpage/Main");

		return { text: resRedirect };
	},
};