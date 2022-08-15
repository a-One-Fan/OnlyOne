import { SlashCommandBuilder } from "@discordjs/builders";

const data = new SlashCommandBuilder()
	.setName("user")
	.setDescription("Replies with info about you.")
	
async function execute(interaction: any) {
	await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
}

export { data, execute };