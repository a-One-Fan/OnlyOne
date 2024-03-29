import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
	.setName("ping")
	.setDescription("Replies with Pong!")
async function execute(interaction: any) {
		await interaction.reply("Pong!");
}

export { data, execute };