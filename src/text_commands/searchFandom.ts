import { getWebpage } from "../extras/networking_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {

	const resHtmlWiki = await getWebpage(`https://www.fandom.com/?s=${encodeURIComponent(regexResults[1])}`);
	const wiki = /<div class="mediawiki-article__content">\s*<a href="https:\/\/([a-zA-Z0-9]+)\.fandom\.com\/wiki/.exec(resHtmlWiki);
	if (!wiki) {
		throw Error(`Printable error: I couldn't find a wiki called ${regexResults[1]}.`);
	}

	const resHtmlArticle = await getWebpage(`https://${wiki[1]}.fandom.com/wiki/Special:Search?query=${encodeURIComponent(regexResults[2])}&scope=internal`);
	const article = /<h3 class="unified-search__result__header">\s*<a href="([^"]+)"/.exec(resHtmlArticle);
	if (!article) {
		throw Error(`Printable error: I couldn't find an article for ${regexResults[2]}`);
	}

	return { text: article[1] };
}

export { execute }