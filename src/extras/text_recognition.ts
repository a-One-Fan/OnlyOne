const { openersBase, openersPunctuation, openersAdjectives, oneRegexes } = require("../config.json");
import { remove } from "./math_stuff";

// Whether 'text' matches any regex of "customOpeners"
// Returns the index of the regex and the rest of 'text' if valid, null otherwise.
// TODO: refactor regexes and use no whitespace option so they're actually readable?
function testAnyRegex(text: string, customOpeners: string[], regexParams = ""): [number, string] | undefined {
	if (!text) return undefined;
	for (const [i, opener] of customOpeners.entries()) {
		const split = text.split(RegExp(opener, regexParams));
		if (split.length > 1) {
			return [i, remove(split, "")[0]];
		}
	}
	return undefined;
}

function flattenArraySeparate(arr: string[], separator: string) {
	let res = "";
	for (let i = 0; i < arr.length - 1; i++) {
		res += arr[i];
		res += separator;
	}
	res += arr.at(-1);
	return res;
}

function makeOpenerRegex() {
	const flatn = flattenArraySeparate;
	let puncts = flatn(openersPunctuation, "");
	puncts += "\\s";
	const adjs = flatn(openersAdjectives, "|");
	const base = flatn(openersBase, "|");
	return `(?:[${puncts}\\s]{1,5})?(?:(?:${adjs})[${puncts}]{1,5})*\\s*(?:(?:${base})[${puncts}]{1,5})\\s*(?:(?:${adjs})[${puncts}]{1,5})*(?:[${puncts}\\s]{1,5})?`;
}

// Whether 'text' starts with a regex from the config (a One-related opener).
function validStart(text: string) {
	const newOpeners = [];
	const openers = [makeOpenerRegex()];
	for (const opener of openers) {
		newOpeners.push("^\\s*" + opener + "\\s*");
	}
	return testAnyRegex(text, newOpeners, "i");
}

function validEnd(text: string) {
	const newOpeners = [];
	const openers = [makeOpenerRegex()];
	for (const opener of openers) {
		newOpeners.push("\\s*" + opener + "\\s*$");
	}
	return testAnyRegex(text, newOpeners, "i");
}

// Counts how many times 'text' has each string regex in 'bits' in it.
// Returns an array with the total, followed by the number of occurences of each thing.
function countOcurrences(text: string, bits: string[]) {
	if (text == null) return null;

	const res = [0];
	text = " " + text + " ";

	for (const bit of bits) {
		let textCut = text;
		let foundIdx = textCut.search(RegExp(bit));
		let count = 0;

		// Special code needed to match Regexes that slightly overlap, e.g.:
		// One One One One One
		// All of these are separated by 1 whitespace, by themselves they fit the regex but running the regex globally would "eat" the space from the first " One ", ending up with "One One One One ",
		// won't match that first One in the remaining string. Using ^ here won't fix this, as this isn't really the start of the string.
		while (foundIdx >= 0) {
			textCut = textCut.substr(foundIdx + 1);
			foundIdx = textCut.search(RegExp(bit));
			count++;
		}

		res.push(count);
		res[0] += count;
	}
	console.log(text, res);
	return res;
}

// Counts how many times the user mentioned One.
// Returns: [Total, One mentions, one mentions, 1 mentions]
function countOnes(text: string) {
	return countOcurrences(text, oneRegexes);
}

// TODO: implement useGuild
async function getUserFromText(text: string, message: any, useGuild = true) {

	let whitespaceStart = 0;
	let i = 0;
	while (i < text.length && text[i] == " ") i++;
	if (i != text.length) whitespaceStart = i;
	i = text.length - 1;
	while (i >= 0 && text[i] == " ") i--;
	text = text.substring(whitespaceStart, i + 1);

	const linkMatch = text.match(/<@!?([0-9]*)>/);
	if (linkMatch) {
		const targetUser = await message.guild.members.fetch(linkMatch[1]);
		if (!targetUser) throw Error(`Printable error: Sorry, I couldn't find a user by that ID ("${linkMatch[1]}").`);
		return targetUser;
	}

	if (text.search(/yourself|you|u|urself|(?:your|ur)\s+(?:pfp|profile\s+pic(?:ture)?)/i) > -1) return message.guild.members.fetchMe();

	if (text.search(/me|myself|my\s+(?:pfp|profile\s+pic(?:ture)?)/i) > -1) return message.member;

	if (text.search(/(?:his|her|their)\s+(?:pfp|profile(?:\s+pic(?:ture)?)?)|him|her/i) > -1) {
		const reply = await message.fetchReference();
		if (!reply) throw Error("Printable error: You need to reply to someone.");
		return reply.member;
	}

	await message.guild.members.fetch();
	const targetUser = await message.guild.members.cache.find((u: any) => (u.displayName.search(text) != -1));
	if (!targetUser) throw Error(`Printable error: Sorry, I couldn't find a user by that name ("${text}").`);
	return targetUser;

}

async function getLinkFromText(text: string, message: any) {
	let whitespaceStart = 0;
	let i = 0;
	while (i < text.length && text[i] == " ") i++;
	if (i != text.length) whitespaceStart = i;
	i = text.length - 1;
	while (i >= 0 && text[i] == " ") i--;
	text = text.substring(whitespaceStart, i + 1);

	const linkMatch = text.match(/(https:\/\/[^ \n]+)/);
	if (linkMatch) return linkMatch[0];

	if (text.search(/^this:?\s*$/mi) > -1) {
		if (!message.attachments.at(0)) throw Error("Printable error: You need to attach a file.");
		return message.attachments.at(0).attachment;
	}

	if (text.search(/^that:?\s*$/mi) > -1) {
		const reply = await message.fetchReference();
		if (!reply) throw Error("Printable error: You need to reply to someone.");
		if (!reply.attachments.at(0)) throw Error("Printable error: Your replied-to message needs to have a file.");
		return reply.attachments.at(0).attachment;
	}

	return (await getUserFromText(text, message)).displayAvatarURL({ format: "png" });

}

export { testAnyRegex, flattenArraySeparate, makeOpenerRegex, validStart,
	validEnd, countOcurrences, countOnes, getUserFromText, getLinkFromText };
