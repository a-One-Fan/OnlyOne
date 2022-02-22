module.exports = {
	async execute(message, regexResults) {
		const row = await message.client.db.findOne({ where: { userID: message.author.id } });

		let res = `You have said my name a total of ${row.lowerOne + row.upperOne} times (${row.upperOne} capitalized correctly and ${row.lowerOne} not),\n` +
		`you've said the digit "1" ${row.digitOne} times. Your reputation is ${row.reputation}.\n` +
		`Your reactType is ${row.reactType}.\n`;
		if (row.addendum) res += `Addendum: ${row.addendum}\n`;

		return res;
	},
};