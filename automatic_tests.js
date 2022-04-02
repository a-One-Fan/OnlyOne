const { executeCommand } = require("./text_commands/text_command_utils.js");

module.exports = {
	// Some long string of stuff that you won't manually write.
	// If a test has this string in its out for one of its attributes, then it will consider as valid anything in that attribute.
	// This is to make testing for files doable.
	any: "djas981hiubvdi12837bc",

	text_command_basic_tests: [

		{ parseType: 4, errorType: 4, category: "Hello" },
		{ in: "One, hello!", out: { text: "https://imgur.com/J4bT846.png" } },
		{ in: "One, Hello!", out: { text: "https://imgur.com/J4bT846.png" } },
		{ in: ".onehello", out: { text: "https://imgur.com/J4bT846.png" } },
		{ in: "One, hello, One!", out: { text: "https://imgur.com/J4bT846.png" } },

	],
	// The call:
	// message.client.db.findOne({ where: { userID: message.author.id } });
	async doTests() {
		const tests = module.exports.text_command_basic_tests;
		const unsuccessful = [];
		const successful = [];

		const fakeRow = { userID: 1, reputation: 0, rank: 0, upperOne: 1, lowerOne: 10,
			digitOne: 11, otherOne: 100, ignore: false, reactType: 0, reactChance: 1, errorType: 0, parseType: 0, customReact: undefined };

		const fakeMessage = { content: "",
			client: { db: { findOne(query) {
				if (query && query.where && query.where.userID == 1) return fakeRow;
				return undefined;
			} } },
			author: { id: 1 },
		};
		let currentCategory = "";
		for (const test of tests) {
			if (test.category) currentCategory = test.category;
			if (test.parseType) fakeRow.parseType = test.parseType;
			if (test.errorType) fakeRow.errorType = test.errorType;
			if (!test.in) continue;

			fakeMessage.content = test.in;
			let err = undefined, res = undefined;
			try {
				res = await executeCommand(fakeMessage);
			} catch (error) { err = error; }
			const entry = { test: test, result: res, category: currentCategory };
			if (err) {
				if (err) {
					console.log("Error when testing:\n");
					console.log(err);
				}
				unsuccessful.push(entry);
			} else {
				let isEqual = true;
				for (const prop in res) {
					if (!test.out[prop]) {
						isEqual = false;
						break;
					}
				}

				if (isEqual) {
					for (const prop in test.out) {
						if (test.out[prop] == module.exports.any) {
							continue;
						}
						if (test.out[prop] != res[prop]) {
							isEqual = false;
							break;
						}
					}
				}

				if (isEqual) successful.push(entry);
				else unsuccessful.push(entry);
			}
		}

		if (!unsuccessful.length) {
			// "\x1b[32m" is green
			console.log("\x1b[32m%s\x1b[0m", `All ${successful.length}/${unsuccessful.length + successful.length} tests succesful!`);
			return;
		}

		console.log("\x1b[31m%s\x1b[0m", `\n${successful.length}/${unsuccessful.length + successful.length} tests succesful.`);

		let lastCategory = module.exports.any;

		for (const res of unsuccessful) {
			if (res.category != lastCategory) {
				lastCategory = res.category;
				console.log(`\n    ${lastCategory}:\n`);
			}
			console.log(
				`Sent: "${res.test.in}"\n` +
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