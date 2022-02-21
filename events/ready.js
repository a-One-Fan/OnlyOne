module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		await client.db.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};