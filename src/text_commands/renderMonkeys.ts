import { renderMonkeys } from "../extras/render_stuff";
import { getLinkFromText } from "../extras/text_recognition";

async function execute(message: any, regexResults: RegExpExecArray) {
	const link = await getLinkFromText(regexResults[1], message);

	const renderResult = await renderMonkeys(link);
	renderResult.text = "Here's your render.";

	return renderResult;
}

export { execute };