const { access } = require("fs");
const { ffmpegLocation, blenderLocation } = require("../config.json");

module.exports = {
	name: "ready",
	once: true,
	async execute(client) {
		const db = await client.db.sync();
		console.log(`Loaded db "${db}"`);

		access(ffmpegLocation, (err) => {
			if (err) console.log(`Error when trying to open Ffmpeg exe at "${ffmpegLocation}":\n${err}`);
			else console.log("Ffmpeg exe can be opened successfully.");
		});

		access(blenderLocation, (err) => {
			if (err) console.log(`Error when trying to open Blender exe at "${blenderLocation}":\n${err}`);
			else console.log("Blender exe can be opened successfully.");
		});

		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};