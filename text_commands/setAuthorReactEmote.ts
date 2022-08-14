module.exports = {
	async execute(message, regexResults, extraRegex) {
		if (regexResults[1]) {
			await message.client.db.update({ customReact: null }, { where: { userID: message.author.id } });
			return { text: "I've reset your react emote. I might use the old one one last time." };
		}
		if (!regexResults[2]) {
			return { text: "You need to specify an ID." };
		}
		try {
			await message.react(regexResults[2]);
		} catch (error) {
			// Don't catch this and instead use the special error-catching code?
			return { text: "I can't react using that emote, sorry." };
		}

		await message.client.db.update({ customReact: regexResults[1] }, { where: { userID: message.author.id } });
		return { text: `I've set your custom react emote to "${regexResults[1]}".` };
	},
};