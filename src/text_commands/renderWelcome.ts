import { renderWelcome, WelcomeParams } from "../extras/render_stuff";
import { getLinkFromText } from "../extras/text_recognition";

async function execute(message: any, regexResults: RegExpExecArray) {
	const renderParams: WelcomeParams = {};

	if (regexResults[1]) {
		renderParams.scene = regexResults[1];
	}

	if (regexResults[2]) {
		renderParams.userMention = regexResults[2];
	}

	if (regexResults[3]) {
		renderParams.hideText = true;
	}

	const link = await getLinkFromText(regexResults[4], message);

	const renderResult = await renderWelcome(link, renderParams) as any;

	renderResult.text = "Here's your customized welcome(-ish?) image.";

	return renderResult;
}

export { execute };