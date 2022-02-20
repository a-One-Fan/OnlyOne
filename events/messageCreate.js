module.exports = {
	name: "messageCreate",
	execute(message) {
		console.log("Got message!");

		if (message.author.bot) return;

		message.reply({ content: `You said: [${message.content}]\n`, allowedMentions: { repliedUser: false } });
		message.react("944199066911395840");
	},
};