// Require the necessary discord.js classes
import fs from "fs";
import { Sequelize } from "sequelize";
import { Client, Collection, Intents } from "discord.js";
import { token } from "./config.json";
import { currentStorage, currentCols } from "./extras/database_stuff";

// Create a new client instance
const client: any = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS, Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_PRESENCES] });

const sequelize = new Sequelize("database", "user", "password", {
	host: "localhost",
	dialect: "sqlite",
	logging: false,
	storage: currentStorage,
});

//	TODO: Use ENUM for reactType instead of INTEGER? Unless, potentially, javascript can't have proper enums?
client.db = sequelize.define("db", currentCols);

client.commands = new Collection();
const commandFiles = fs.readdirSync("./commands").filter((file: string) => file.endsWith(".ts"));

for (const file of commandFiles) {
	const command = await import(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


const eventFiles = fs.readdirSync("./events").filter((file: string) => file.endsWith(".js"));

for (const file of eventFiles) {
	const event = await import(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args: any) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any) => event.execute(...args));
	}
}

// Login to Discord with your client's token
client.login(token);