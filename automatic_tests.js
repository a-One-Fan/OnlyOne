const { executeCommand } = require("./text_commands/text_command_utils.js");
const { evenify, clamp, find, findDict, remove } = require("./extras/math_stuff.js");
const { rm } = require("fs");

// Some long string of stuff that you won't manually write.
// If a test has this string in its out for one of its attributes, then it will consider as valid anything in that attribute.
// This is to make testing for files doable.
const ANY = "This represents the possibility for any non-false/undefined input.";
const OPTIONAL = "This represents the possibility for completely optional input.";
const SIMULATE_MESSAGE = "This represents that the function to test should be a simulated text message.";

module.exports = {
	auto_tests: [
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
		{ in: [[-1, -2, -3, -4], -3], out: 3 },
		{ in: [[], 2], out: -1 },
		{ in: [[-1, -2], 2], out: -1 },

		{ category: "findDict", func: findDict },

		{ category: "remove", func: remove },
		{ in: [[-1, -2, -3, -4], -3], out: [-1, -2, -4] },
		{ in: [[], 2], out: [] },
		{ in: [[-1, -2], 2], out: [-1, -2] },
	],
	// The call:
	// message.client.db.findOne({ where: { userID: message.author.id } });
	async doTests() {
		const tests = module.exports.auto_tests;
		let unsuccessful = 0;
		let func_to_test = SIMULATE_MESSAGE;
		const results = [];

		const fakeRow = { userID: 1, reputation: 0, rank: 0, upperOne: 1, lowerOne: 10,
			digitOne: 11, otherOne: 100, ignore: false, reactType: 0, reactChance: 1, errorType: 0, parseType: 0, customReact: undefined };

		const fakeMessage = { content: "",
			client: { db: { findOne(query) {
				if (query && query.where && query.where.userID == 1) return fakeRow;
				return undefined;
			} } },
			author: { id: 1 },
			reply(content) {
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
				res = func_to_test(...test.in);
			}
			const entry = { test: test, result: res, category: currentCategory, successful: false };
			results.push(entry);
		}

		for (const res of results) {
			let err = undefined;
			try {
				res.result = await res.result;
			} catch (error) { err = error; }
			if (err) {
				if (err) {
					console.log("Error when testing:\n");
					console.log(err);
				}
				unsuccessful++;
				continue;
			} else {
				const checkSingularOut = (obj) => {
					for (const prop in res.result) {
						if (!obj[prop]) {
							return false;
						}
					}
					for (const prop in obj) {
						if (obj[prop] == OPTIONAL) continue;

						if ((obj[prop] == ANY) && (res.result[prop])) {
							continue;
						}
						if (obj[prop] instanceof RegExp) {
							if (obj[prop].test(res.result[prop])) {
								continue;
							} else {
								return false;
							}
						}
						if (obj[prop] != res.result[prop]) {
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
					for (const singleNotOut of res.test.notOutList) {
						isOneTrue = isOneTrue || checkSingularOut(singleNotOut);
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

		for (const test of results) if (test.result.cleanup) rm(test.result.cleanup, { recursive: true, force: true }, (err) => { if (err) console.log("Got error while deleting:", err); });

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
			console.log(
				`In: "${res.test.in}"\n` +
				"Expected:");
			console.log(res.test.out);
			if (!res.result) {
				console.log("Got: An error (see above)");
			} else {
				console.log("Got:");
				console.log(res.result);
			}
		}

		console.log("\n");
	},
};