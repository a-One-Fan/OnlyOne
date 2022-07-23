const { renderMonkeys } = require("../extras/render_stuff.js");
const { getLinkFromText } = require("../extras/text_recognition.js");

module.exports = {
	async execute(message, regexResults) {
		const link = await getLinkFromText(regexResults[1], message);

		const renderResult = await renderMonkeys(link);
		renderResult.text = "Here's your render.";

		return renderResult;
	},
};