import { renderBarrel } from "../extras/render_stuff";
import { getLinkFromText } from "../extras/text_recognition";

async function execute(message: any, regexResults: RegExpExecArray) {
	const link = await getLinkFromText(regexResults[1], message);

	const renderResult = await renderBarrel(link);
	renderResult.text = "Rolling...";

	return renderResult;
}

export { execute };