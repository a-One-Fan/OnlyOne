module.exports = {
	async execute(message, regexResults) {
		const row = await message.client.db.findOne({ where: { userID: message.author.id } });
		let reactTypeText = "";
		const reacts = require("../configurables/message_reacts.js");
		if (row.reactType < 0 || row.reactType >= reacts.reactTypes.length)	{
			reactTypeText = reacts.unknownReact;
		} else {
			reactTypeText = reacts.reactTypes[row.reactType].name;
			reactTypeText = "I will " + reactTypeText;
		}
		let res = `You have said my name a total of ${row.lowerOne + row.upperOne} times (${row.upperOne} capitalized ${row.reputation > 5.0 ? "" : "correctly"} and ${row.lowerOne} not),\n` +
		`you've said the digit "1" ${row.digitOne} times and you've mentioned me with other names ${row.otherOne} times. Your reputation is ${row.reputation}${row.reputation > 5.0 ? "!" : "."}\n` +
		`${reactTypeText} (type ${row.reactType}), with a ${row.reactChance * 100.0}% chance (${row.reactChance})${row.reputation > 5.0 ? "!" : "."}\n`;
		if (row.addendum) res += `Addendum: ${row.addendum}\n`;

		return { text: res };
	},
};