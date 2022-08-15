import { access, writeFileSync } from "fs";
import { ffmpegFolderLocation, blenderLocation, ignoredChannelsFilepath, userJoinChannelsFilepath } from "../config.json";
import { updateCurrencies } from "../extras/currency";
import { migrate } from "../extras/database_stuff";
import { doTests } from "../automatic_tests";
import { exit } from "process";

const doMigrate = false;

const name = "ready";
const once = true;
async function execute(client: any) {
	const db = await client.db.sync();
	console.log(`Loaded db "${db}"`);

	if (doMigrate) {
		try {
			const migration = await migrate(db);
			console.log("Migrating database...\n", migration, "\n\nMigrated database. 3 example entries above.\n");
		} catch (error) {
			console.log("Couldn't migrate to new database:\n", error);
		}
	}

	const ffmpegLocation = ffmpegFolderLocation + "ffmpeg.exe";
	access(ffmpegLocation, (err) => {
		if (err) console.log(`Error when trying to open Ffmpeg exe at "${ffmpegLocation}":\n${err}`);
		else console.log("Ffmpeg exe can be opened successfully.");
	});

	const ffprobeLocation = ffmpegFolderLocation + "ffprobe.exe";
	access(ffprobeLocation, (err) => {
		if (err) console.log(`Error when trying to open Ffprobe exe at "${ffprobeLocation}":\n${err}`);
		else console.log("Ffprobe exe can be opened successfully.");
	});

	access(blenderLocation, (err) => {
		if (err) console.log(`Error when trying to open Blender exe at "${blenderLocation}":\n${err}`);
		else console.log("Blender exe can be opened successfully.");
	});

	// TODO: make function for automatically checking and setting up a config file like this
	access(ignoredChannelsFilepath, (err) => {
		if (err) {
			console.log(`Error when trying to open ignored channels file at "${ignoredChannelsFilepath}":\n${err}\nAttempting to create file...`);
			const blankIgnoredChannels = { channels: [] };
			try {
				writeFileSync(ignoredChannelsFilepath, JSON.stringify(blankIgnoredChannels, null, 4));
				console.log("Created ignored channels file.");
			} catch (err) {
				console.log(`Error\n${err}\nWhile trying to create ignored channels file! Please create the file yourself or ensure OnlyOne has sufficient permissions.`);
				exit(1);
			}
		} else {
			console.log("Ignored channels can be opened successfully.");
		}
	});

	access(userJoinChannelsFilepath, (err) => {
		if (err) {
			console.log(`Error when trying to open user join/leave channels file at "${userJoinChannelsFilepath}":\n${err}\nAttempting to create file...`);
			const blankUserJoinChannels = { servers: {} };
			try {
				writeFileSync(userJoinChannelsFilepath, JSON.stringify(blankUserJoinChannels, null, 4));
				console.log("Created user join/leave channels file.");
			} catch (err) {
				console.log(`Error\n${err}\nWhile trying to create user join/leave channels file! Please create the file yourself or ensure OnlyOne has sufficient permissions.`);
				exit(1);
			}
		} else {
			console.log("User join/leave channels can be opened successfully.");
		}
	});

	try {
		const updateRes = updateCurrencies();
		if (updateRes > 0) {
			console.log(`Did not update currencies. Last updated ${updateRes / 1000} seconds ago.`);
		} else {
			console.log("Currencies updated.");
		}
	} catch (error) {
		console.log("Could not update currencies.\n", error);
	}

	doTests();

	console.log(`Ready! Logged in as ${client.user.tag}`);
}

export { name, once, execute }