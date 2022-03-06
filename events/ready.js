const { access } = require("fs");
const { ffmpegFolderLocation, blenderLocation } = require("../config.json");
const { updateCurrencies } = require("../extras/currency.js");

module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		const db = await client.db.sync();
		console.log(`Loaded db "${db}"`);

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

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};