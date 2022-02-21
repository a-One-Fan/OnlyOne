// Require the necessary discord.js classes
const fs = require("fs");
const Sequelize = require("sequelize");
const { Client, Collection, Intents } = require("discord.js");
const { token } = require("./config.json");

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING] });

const sequelize = new Sequelize("database", "user", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: "database.sqlite",
});

//	TODO: Use ENUM for reactType instead of INTEGER? Unless, potentially, javascript can't have proper enums?
client.db = sequelize.define("db", {
	userID: { type: Sequelize.STRING, unique: true, allowNull: false },
	reputation: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
	upperOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	lowerOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	digitOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	ignore: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
	reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	addendum: Sequelize.TEXT,
});


client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Login to Discord with your client's token
client.login(token);