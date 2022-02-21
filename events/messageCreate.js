module.exports = {
	name: "messageCreate",
	async execute(message) {
		console.log(`Got message! From: ${message.author.id}`);
		if (message.author.bot) return;


		// TODO: Not yandev style handling of the various text-based commands
		let textContent = "";

		if (message.content == "One, I'd like to interact with you!") {
			const row = await message.client.db.findOne({ where: { userID: message.author.id } });
			textContent += "Alright.\n";
			if (!row) {
				textContent += "Looks like it's our first time.\n";
				try {
					const entry = await message.client.db.create({
						userID: message.author.id,
						ignore: 1,
					});
					console.log(entry.toJSON());
				} catch (error) {
					if (error.name === "SequelizeUniqueConstraintError") {
						textContent += "There's already an entry in the DB...\n";
					} else {
						textContent += `Something else went wrong: "${error.name}": ${error.message}\n`;
					}
				}
			} else {
				await message.client.db.update({ ignore: 1 }, { where: { userID: message.author.id } });
			}
		}

		if (message.content == "One, print the database!") {
			const tagList = await message.client.db.findAll({ attributes: ["userID"] });
			textContent += tagList.map(t => t.userID).join(", ") || "No tags set.";
		}

		const row = await message.client.db.findOne({ where: { userID: message.author.id } });
		// && row.ignore > 0
		if (row) {
			if (message.content.toLowerCase().indexOf("one") >= 0) {
				await row.increment("lowerOne");
				message.react("944199066911395840");
			}
			if (message.content == "One, what are my stats?") {
				textContent += `You've said my name ${row.lowerOne + row.upperOne} times (${row.upperOne} times properly capitalized and ${row.upperOne} times in lowercase),\n
				You've said the digit '1' ${row.digitOne} times. Your reptutation is ${row.reputation} and you want me to react to your messages ${row.reactType}.\n
				The addendum says "${row.addendum}".\n`;
			}
		}
		if (textContent != "") {
			message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
		}
	},
};