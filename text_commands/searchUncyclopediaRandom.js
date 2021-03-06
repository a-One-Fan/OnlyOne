const { getRedirect } = require("../extras/networking_stuff.js");

module.exports = {
	async execute(message, regexResults, extraRegex) {

		const resRedirect = await getRedirect("https://en.uncyclopedia.co/wiki/Special:RandomRootpage/Main");

		return { text: resRedirect };
	},
};