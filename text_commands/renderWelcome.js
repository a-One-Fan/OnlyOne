const { renderWelcome } = require("../extras/render_stuff.js");
const { getLinkFromText } = require("../extras/text_recognition.js");

module.exports = {
	async execute(message, regexResults) {
		const renderParams = {};

		if (regexResults[1]) {
			renderParams.scene = regexResults[1];
		}

		if (regexResults[2]) {
			renderParams.userMention = regexResults[2];
		}

		const link = await getLinkFromText(regexResults[3], message);

		const renderResult = await renderWelcome(link, renderParams);

		renderResult.text = "Here's your customized welcome(-ish?) image.";

		return renderResult;
	},
};