import { access, writeFileSync, readdirSync } from "fs";
import { ffmpegFolderLocation, blenderLocation, ignoredChannelsFilepath, userJoinChannelsFilepath } from "../config.json";
import { updateCurrencies, CURRENCIES_PATH } from "../extras/currency";
import { migrate } from "../extras/database_stuff";
import { doTests } from "../automatic_tests";
import { exit } from "process";
import { TMPDIR } from "../extras/render_stuff"
import { cleanup } from "../extras/file_stuff";

const doMigrate = false;

const name = "ready";
const once = true;

function accessTryCreate(filepath: string, name: string, json: any){
	access(filepath, (err) => {
		if (err) {
			console.log(`Error when trying to open ${name} file at "${filepath}":\n${err}\nAttempting to create file...`);
			try {
				writeFileSync(filepath, JSON.stringify(json, null, 4));
				console.log("Created ignored channels file.");
			} catch (err) {
				console.log(`Error\n${err}\nWhile trying to create ignored channels file! Please create the file yourself or ensure OnlyOne has sufficient permissions.`);
				exit(1);
			}
		} else {
			console.log(`File for ${name} can be opened successfully.`);
		}
	});
}

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

	accessTryCreate(ignoredChannelsFilepath, "ignored channels", { channels: [] });

	accessTryCreate(userJoinChannelsFilepath, "user join/leave channels", { channels: [] });

	let dirPaths = readdirSync(TMPDIR)
	if (dirPaths.length > 0) {
		console.log("Unclean tmp directory! Cleaning:");
		let i: number;
		for (i=0; i<dirPaths.length; i++){
			dirPaths[i] = TMPDIR + dirPaths[i]
		}
		console.log(dirPaths);
		cleanup(dirPaths);
	}

	try {
		await accessTryCreate(CURRENCIES_PATH, "currencies", { lastUpdated: new Date(1000) })

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