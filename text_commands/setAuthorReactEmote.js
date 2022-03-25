module.exports = {
	async execute(message, regexResults, extraRegex) {
		try {
			await message.react(regexResults[1]);
		} catch (error) {
			// Don't catch this and instead use the special error-catching code?
			return { text: "I can't react using that emote, sorry." };
		}
		await message.client.db.update({ customReact: regexResults[1] }, { where: { userID: message.author.id } });
		return { text: `I've set your custom react emote to "${regexResults[1]}".` };
	},
};