const { validStart, countOnes } = require("../extras/text_recognition.js");

module.exports = {
	name: "messageCreate",
	async execute(message) {
		console.log(`Got message! From: ${message.author.id}`);

		if (message.author.bot) return;


		// TODO: Even less yandev-ish code (mainly in if split and if oneCount, this here \\/ is a special case that shouldn't get regex'd and all that other stuff)
		let textContent = "";
		let doReact = false;
		let firstCommand = false;
		if (message.content == "One, I'd like to interact with you!") {
			firstCommand = true;
			const row = await message.client.db.findOne({ where: { userID: message.author.id } });
			textContent += "Alright. ";
			if (!row) {
				textContent += "Looks like it's our first time.\n";
				try {
					await message.client.db.create({ userID: message.author.id, ignore: false });
				} catch (error) {
					if (error.name === "SequelizeUniqueConstraintError") {
						// This should be impossible?
						textContent += "There's already an entry in the DB...\n";
					} else {
						textContent += `Something else went wrong: "${error.name}": ${error.message}\n`;
					}
				}
			} else {
				if (!row.ignore) textContent += "...Though you already can.\n";
				await message.client.db.update({ ignore: false }, { where: { userID: message.author.id } });
			}
		}

		let row = await message.client.db.findOne({ where: { userID: message.author.id } });
		if (!row || row.ignore) { return; }

		const oneCount = countOnes(message.content);

		if (oneCount) {
			const oldtotal = row.lowerOne + row.upperOne;
			const oldtotalDigit = oldtotal + row.digitOne;
			message.client.db.update({ upperOne: row.upperOne + oneCount[1], lowerOne: row.lowerOne + oneCount[2], digitOne: row.digitOne + oneCount[3] }, { where: { userID: message.author.id } });

			// I love the lack of enums
			// 0: Always, 1: only One, 2: only one, 3: only 1, 4: every 10 mentions of One or one, 5: every 10 mentions of One or one or 1, 6: 10% chance
			// TODO: Use list of Guild and emote IDs
			if (row.reactType == 0) {
				doReact = true;
			} else if (row.reactType == 1) {
				if (oneCount[1] > 0) doReact = true;
			} else if (row.reactType == 2) {
				if (oneCount[2] > 0) doReact = true;
			} else if (row.reactType == 3) {
				if (oneCount[3] > 0) doReact = true;
			} else if (row.reactType == 4) {
				if (Math.floor((oldtotal + oneCount[0] - oneCount[4]) / 10) - Math.floor(oldtotal / 10) > 0) doReact = true;
			} else if (row.reactType == 5) {
				if (Math.floor((oldtotalDigit + oneCount[0]) / 10) - Math.floor(oldtotalDigit / 10)) doReact = true;
			} else if (row.reactType == 6) {
				if (Math.random() > 0.9) doReact = true;
			}
		}

		// Update the current row if we counted more Ones.
		row = await message.client.db.findOne({ where: { userID: message.author.id } });
		const split = validStart(message.content);
		// A flag that is currently necessary due to yandev-style code. See TODO above.
		let recognized = false;

		if (split && !firstCommand) {
			if (split[1].search(/what\s+do\s+you\s+know\s+about\s+me[.?!]{0,3}\s*$|what\s+are\s+my\s+stats[.?!]{0,3}\s*$|what\s+do\s+you\s+think\s+of\s+me[.?!]{0,3}\s*$/i) >= 0) {
				textContent += `You have said my name a total of ${row.lowerOne + row.upperOne} times (${row.upperOne} capitalized correctly and ${row.lowerOne} not),\n` +
					`you've said the digit "1" ${row.digitOne} times. Your reputation is ${row.reputation}.\n` +
					`Your reactType is ${row.reactType}.\n`;
				if (row.addendum) textContent += `Addendum: ${row.addendum}\n`;
				recognized = true;
			}
			if (split[1].search(/ignore\s+me[.?!]{0,3}\s*$|don'?t\s+talk\s+to\s+me[.?!]{0,3}\s*$|don'?t\s+react\s+to\s+me[.?!]{0,3}\s*$/i) >= 0) {
				await message.client.db.update({ ignore: true }, { where: { userID: message.author.id } });
				textContent += "Alright then, I'll ignore you.\n";
				recognized = true;
				doReact = false;
			}
			const reactRes = /set\s+my\s+reacttype\s+to\s+(\d)[.?!]{0,3}\s*$/i.exec(split[1]);
			if (reactRes) {
				await message.client.db.update({ reactType: parseInt(reactRes[1]) }, { where: { userID: message.author.id } });
				// The string is parsed and then stringified again so the user may know what it actually got set to in case it's not actually correct.
				textContent += `I've set your reactType to ${parseInt(reactRes[1])} from here on.\n`;
				recognized = true;
			}
			if (!recognized) {
				textContent += "I didn't quite catch that, care to try again?\r\n";
			}
		}

		if (doReact) { message.react("944199066911395840"); }
		if (textContent != "") {
			message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
		}
	},
};