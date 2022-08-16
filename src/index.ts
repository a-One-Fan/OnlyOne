// Require the necessary discord.js classes
import fs from "fs";
import { Sequelize } from "sequelize";
import { Client, Collection, Intents } from "discord.js";
import { token } from "./config.json";
import { currentStorage, currentCols } from "./extras/database_stuff";
import { slashCommands } from "./slash_commands/_importAll"
import { events } from "./events/_importAll"

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

client.db = sequelize.define("db", currentCols);
	
client.commands = new Collection();
	
for (const slashCommand of slashCommands) {
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(slashCommand.data.name, slashCommand);
}
	
	
for (const event of events) {
	if (event.once) {
		client.once(event.name, (...args: any) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any) => event.execute(...args));
	}
}
	
// Login to Discord with your client's token
client.login(token);

