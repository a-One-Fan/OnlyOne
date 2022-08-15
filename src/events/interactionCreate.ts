const name = "interactionCreate";

function execute(interaction: any) {
	if (!interaction.isCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		command.execute(interaction);
	} catch (error) {
		console.error(error);
		interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
	}
}

export { name, execute }