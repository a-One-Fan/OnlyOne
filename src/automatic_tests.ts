import { executeCommand } from "./text_commands/_text_command_utils";
import { evenify, clamp, find, findDict, remove } from "./extras/math_stuff";
import { getLinkFromText } from "./extras/text_recognition";
import { cleanup } from "./extras/file_stuff";

// Some long string of stuff that you won't manually write.
// If a test has this string in its out for one of its attributes, then it will consider as valid anything in that attribute.
// This is to make testing for files doable.
const ANY = "This represents the possibility for any non-false/undefined input.";
const OPTIONAL = "This represents the possibility for completely optional input.";
const SIMULATE_MESSAGE = "This represents that the function to test should be a simulated text message.";

const MENTION_LINK = "https://www.mentionPfp.com/pfp.png"; const MENTION_LINK_GUILD = "https://guild.mentionPfp.com/pfp.png";
const AUTHOR_LINK = "https://www.authorpfp.com/pfp.png"; const AUTHOR_LINK_GUILD = "https://guild.authorpfp.com/pfp.png";
const REPLIED_AUTHOR_LINK = "https://www.repliedpfp.com/pfp.png"; const REPLIED_AUTHOR_LINK_GUILD = "https://guild.repliedpfp.com/pfp.png";
const ONLYONE_LINK = "https://o.ne/pfp.png"; const ONLYONE_LINK_GUILD = "https://o.ne/pfp_guild.png";
const ATTACHMENT_LINK = "https://www.discord.com/attachment.png";
const REPLIED_ATTACHMENT_LINK = "https://www.discord.com/other_attachment.png";
const USER_LINK = "https://www.who.com/pfp.png"; const GUILD_USER_LINK = "https://guild.who.com/pfp.png";
const FAKE_MESSAGE_FOR_LINKS = {
	client:	{
		users: {
			fetch(id: string) {
				if (id == "111") {
					return { displayAvatarURL() { return MENTION_LINK; } };
				} else {
					return null;
				}
			},
			cache: { find(func: any) { return { displayAvatarURL() { return USER_LINK; } };} },
		},
		user: { displayAvatarURL() { return ONLYONE_LINK; } },
	},
	author: { displayAvatarURL() { return AUTHOR_LINK; } },
	member: { displayAvatarURL() { return AUTHOR_LINK_GUILD; } },
	attachments: { at(val: number) { return val == 0 ? { attachment: ATTACHMENT_LINK } : {}; } },
	fetchReference() {
		return {
			author: { displayAvatarURL() { return REPLIED_AUTHOR_LINK; } },
			member: { displayAvatarURL() { return REPLIED_AUTHOR_LINK_GUILD; } },
			attachments: { at(val: number) { return val == 0 ? { attachment: REPLIED_ATTACHMENT_LINK } : {}; } },
		};
	},
	guild: {
		members: {
			fetch(id: string) {
				if (id == "111") {
					return { displayAvatarURL() { return MENTION_LINK_GUILD; } };
				} else {
					return null;
				}
			},
			cache: { find(func: any) { return { displayAvatarURL() { return GUILD_USER_LINK; } };} },
		},
		me: { displayAvatarURL() { return ONLYONE_LINK_GUILD; } }
	},
};

const auto_tests = [
	{ parseType: 4, errorType: 4 },
	{ func: SIMULATE_MESSAGE },
	{ category: "Parsing" },
	{ in: "One, hello!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, Hello!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: ".onehello", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, hello, One!", out: { text: "https://imgur.com/J4bT846.png" } },

	{ category: "Calculate" },
	{ in: "One, calculate 2+3", out: { text: "5." } },
	{ in: "One, calculate 2*3", out: { text: "6." } },
	{ in: "One, calculate (6+7)*8", out: { text: "104." } },
	{ in: "One, calculate floor ((sin 1) * 2)", out: { text: "1." } },
	{ in: "One, calculate 1 m to cm", out: { text: "100 centimetres." } },

	{ category: "Renders" },
	{ in: "One, snap this: https://i.imgur.com/J4bT846.png", out: { text: ANY, files: ANY, cleanup: OPTIONAL } },
	{ in: "One, test render this: https://i.imgur.com/J4bT846.png", out: { text: "Here's your render.", files: ANY, cleanup: OPTIONAL } },
	{ in: "One, barrel roll https://i.imgur.com/J4bT846.png", out: { text: "Rolling...", files: ANY, cleanup: OPTIONAL } },

	{ category: "Image Macros" },
	{ in: "One, hello!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, goodbye!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, bye!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, see ya!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, wave goodbye!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, wave goodbye to Testperson the third!", out: { text: "https://imgur.com/J4bT846.png" } },
	{ in: "One, shower!", out: { text: "https://imgur.com/dOujMWX.webm" } },
	{ in: "One, dance!", out: { text: "https://imgur.com/KT7TTUk.webm" } },

	{ category: "evenify()", func: evenify },
	{ in: [[1920, 1080]], out: [1920, 1080] },
	{ in: [[1919, 1079]], out: [1920, 1080] },
	{ in: [[1920, 1079]], out: [1920, 1080] },
	{ in: [[1919, 1080]], out: [1920, 1080] },

	{ category: "clamp()", func: clamp },
	{ in: [0.0, 1.0, 0.5], out: 0.5 },
	{ in: [0.0, 1.0, 1.5], out: 1.0 },
	{ in: [0.0, 1.0, 1.0], out: 1.0 },
	{ in: [0.0, 1.0, 0.0], out: 0.0 },
	{ in: [0.0, 1.0, -1.0], out: 0.0 },
	{ in: [-2.0, -1.0, 0.0], out: -1.0 },
	{ in: [-2.0, -1.0, -4.0], out: -2.0 },

	{ category: "find()", func: find },
	{ in: [[-1, -2, -3, -4], -3], out: 2 },
	{ in: [[], 2], out: -1 },
	{ in: [[-1, -2], 2], out: -1 },

	{ category: "findDict()", func: findDict },
	{ in: [{ a: -1, b: -2, c: -3, d: -4 }, "c"], notOut: -1 },
	{ in: [{ a: -1, b: -2, c: -3, d: -4 }, "a"], notOut: -1 },
	{ in: [{ a: -1, b: -2, c: -3, d: -4 }, "bla"], out: -1 },

	{ category: "remove()", func: remove },
	{ in: [[-1, -2, -3, -4], -3], out: [-1, -2, -4] },
	{ in: [[], 2], out: [] },
	{ in: [[-1, -2], 2], out: [-1, -2] },

	{ category: "getLinkFromText()", func: getLinkFromText },
	{ in: ["aboobaahttps://www.test.com/a.png", FAKE_MESSAGE_FOR_LINKS], out: "https://www.test.com/a.png" },
	{ in: ["https://testo.com/b.png", FAKE_MESSAGE_FOR_LINKS], out: "https://testo.com/b.png" },
	{ in: ["https://testeee.com/woo.png    yay", FAKE_MESSAGE_FOR_LINKS], out: "https://testeee.com/woo.png" },
	{ in: ["<@!111> its one", FAKE_MESSAGE_FOR_LINKS], out: MENTION_LINK_GUILD },
	{ in: ["<@!111>", FAKE_MESSAGE_FOR_LINKS], out: MENTION_LINK_GUILD },
	{ in: ["eyooo<@!111>", FAKE_MESSAGE_FOR_LINKS], out: MENTION_LINK_GUILD },
	{ in: ["this:", FAKE_MESSAGE_FOR_LINKS], out: ATTACHMENT_LINK },
	{ in: ["this: https://www.first.this/link.png", FAKE_MESSAGE_FOR_LINKS], out: "https://www.first.this/link.png" },
	{ in: ["this:   ", FAKE_MESSAGE_FOR_LINKS], out: ATTACHMENT_LINK },
	{ in: ["this  ", FAKE_MESSAGE_FOR_LINKS], out: ATTACHMENT_LINK },
	{ in: ["thiis  ", FAKE_MESSAGE_FOR_LINKS], out: GUILD_USER_LINK },
	{ in: ["this:  blabloo", FAKE_MESSAGE_FOR_LINKS], out: GUILD_USER_LINK },
	{ in: ["that", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_ATTACHMENT_LINK },
	{ in: ["that:     ", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_ATTACHMENT_LINK },
	{ in: ["tHAT:     ", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_ATTACHMENT_LINK },
	{ in: ["that:   eyooo", FAKE_MESSAGE_FOR_LINKS], out: GUILD_USER_LINK },
	{ in: ["his pfp", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_AUTHOR_LINK_GUILD },
	{ in: ["her", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_AUTHOR_LINK_GUILD },
	{ in: ["HER", FAKE_MESSAGE_FOR_LINKS], out: REPLIED_AUTHOR_LINK_GUILD },
	{ in: ["Babooga the First", FAKE_MESSAGE_FOR_LINKS], out: GUILD_USER_LINK },
]

interface ITestResult{
	test: any;
	result: any;
	category: string;
	successful: boolean;
	func: any;
	error?: any;
}

class TestResult{
	test: any;
	result: any;
	category!: string;
	successful!: boolean;
	func: any;
	error?: any;
	constructor(obj: ITestResult) {
		Object.assign(this, obj);
	}
}

async function doTests() {
	const tests = auto_tests;
	let unsuccessful = 0;
	let func_to_test: any = SIMULATE_MESSAGE;
	const results: TestResult[] = [];

	const fakeRow = { userID: 1, reputation: 0, rank: 0, upperOne: 1, lowerOne: 10,
		digitOne: 11, otherOne: 100, ignore: false, reactType: 0, reactChance: 1, errorType: 0, parseType: 0, customReact: undefined };

	// The call:
	// message.client.db.findOne({ where: { userID: message.author.id } });
	const fakeMessage: any = { content: "",
		client: { db: { findOne(query: any) {
			if (query && query.where && query.where.userID == 1) return fakeRow;
			return undefined;
		} } },
		author: { id: 1 },
		reply(content: any) {
			console.log("While testing, got a reply: ");
			console.log(content);
		},
	};
	let currentCategory = "";

	for (const test of tests) {
		if (test.category) currentCategory = test.category;
		if (test.parseType) fakeRow.parseType = test.parseType;
		if (test.errorType) fakeRow.errorType = test.errorType;
		if (test.func) func_to_test = test.func;
		if (!test.in) continue;

		let res;
		if (func_to_test == SIMULATE_MESSAGE) {
			fakeMessage.content = test.in;
			const copiedFakeMessage = {};
			Object.assign(copiedFakeMessage, fakeMessage);
			res = executeCommand(copiedFakeMessage);
		} else {
			// This is so that the program itself doesn't exit if an exception is thrown, because for some reason it doesn't get with just a promise/async???
			const func = async () => {
				let catchres = undefined;
				try {
					catchres = await func_to_test(...test.in);
				} catch (err) {
					return err;
				}
				return catchres;
			};
			res = func();
			// res = func_to_test(...test.in);
		}
		const entry = { test: test, result: res, category: currentCategory, successful: false, func: func_to_test };
		results.push(entry);
	}

	for (const res of results) {
		let err = undefined;
		try {
			res.result = await res.result;
		} catch (error) { err = error; }
		if (err) {
			// console.log("Error when testing:\n");
			// console.log(err);
			res.error = err;
			unsuccessful++;
			continue;
		} else {
			const checkSingularOut = (out: any) => {
				if (typeof (out) != "object") {
					return res.result == out;
				}
				for (const prop in res.result) {
					if (!out[prop]) {
						return false;
					}
				}
				for (const prop in out) {
					if (out[prop] == OPTIONAL) continue;

					if ((out[prop] == ANY) && (res.result[prop])) {
						continue;
					}
					if (out[prop] instanceof RegExp) {
						if (out[prop].test(res.result[prop])) {
							continue;
						} else {
							return false;
						}
					}
					if (out[prop] != res.result[prop]) {
						return false;
					}
				}
				return true;
			};
			let isEqual = true;
			if (res.test.out) isEqual = isEqual && checkSingularOut(res.test.out);
			if (res.test.notOut) isEqual = isEqual && (!checkSingularOut(res.test.notOut));
			if (res.test.notOutList) {
				for (const singleNotOut of res.test.notOutList) {
					isEqual = isEqual && (!checkSingularOut(singleNotOut));
				}
			}
			if (res.test.outList) {
				let isOneTrue = false;
				for (const singleOut of res.test.notOutList) {
					isOneTrue = isOneTrue || checkSingularOut(singleOut);
				}
				isEqual = isOneTrue && isEqual;
			}

			if (!isEqual) {
				unsuccessful++;
				continue;
			}
		}
		res.successful = true;
	}

	console.log("\n");

	for (const test of results) if (test.result && test.result.cleanup) {
		cleanup(test.result.cleanup)
	}

	if (!unsuccessful) {
		// "\x1b[32m" is green
		console.log("\x1b[32m%s\x1b[0m", `All ${results.length - unsuccessful}/${results.length} tests succesful!\n`);
		return;
	}

	console.log("\x1b[31m%s\x1b[0m", `\n${results.length - unsuccessful}/${results.length} tests succesful.\n`);

	let lastCategory = ANY;

	for (const res of results) {
		if (res.successful) continue;
		if (res.category != lastCategory) {
			lastCategory = res.category;
			console.log(`\n    ${lastCategory}:\n`);
		}

		console.log("");
		if (res.func == SIMULATE_MESSAGE) {
			console.log(`Sent message: "${res.test.in}"`);
		} else {
			console.log(`In: ${JSON.stringify(res.test.in)}`);
		}
		console.log("Expected:");

		if (res.test.out) {
			console.log(res.test.out);
		}

		if (res.test.outList) {
			console.log("one of ");
			console.log(res.test.outList);
		}

		if (res.test.notOut) {
			console.log("!= ");
			console.log(res.test.notOut);
		}

		if (res.test.notOutList) {
			console.log("NOT one of ");
			console.log(res.test.notOutList);
		}

		if (res.error) {
			console.log("Got an error:");
			console.log(res.error);
		} else {
			console.log("Got:");
			console.log(res.result);
		}
	}

	console.log("\n");
}

export { doTests };