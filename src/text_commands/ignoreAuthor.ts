async function execute(message: any, regexResults: RegExpExecArray) {
	await message.client.db.update({ ignore: true }, { where: { userID: message.author.id } });
	return { text: "Alright then, I'll ignore you.", abortReact: true };
}

export { execute };