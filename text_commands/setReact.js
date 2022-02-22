module.exports = {
	async execute(message, regexResults) {
		await message.client.db.update({ reactType: parseInt(regexResults[1]) }, { where: { userID: message.author.id } });

		// The string is parsed and then stringified again so the user may know what it actually got set to in case it's not actually correct.
		return { text: `I've set your reactType to ${parseInt(regexResults[1])} from here on.\n` };
	},
};