import { getRedirect } from "../extras/networking_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {

	const resRedirect = await getRedirect("https://en.uncyclopedia.co/wiki/Special:RandomRootpage/Main");

	return { text: resRedirect };
}

export { execute }