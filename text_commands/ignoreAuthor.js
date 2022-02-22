module.exports = {
	async execute(message, regexResults) {
		await message.client.db.update({ ignore: true }, { where: { userID: message.author.id } });
		return "Alright then, I'll ignore you.";
	},
};