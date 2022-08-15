import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
	.setName("server")
	.setDescription("Replies with nothing useful.")

async function execute(interaction: any) {
	await interaction.reply("Server info.");
}

module.exports = { data, execute };