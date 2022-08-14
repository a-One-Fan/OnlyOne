const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("server")
		.setDescription("Replies with nothing useful."),
	async execute(interaction) {
		await interaction.reply("Server info.");
	},
};