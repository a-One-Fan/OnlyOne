import { TextCommandResult } from "./_commands";
import { MessageAttachment } from "discord.js";

import { createConnection } from 'node:net'
import { speakServerHost, speakServerPort } from "../config.json"
import { find } from "../extras/math_stuff"
import { writeStrIntoBuf } from "../extras/networking_stuff"

import fs from "fs"

function makeuuid() {
	return Math.random().toString(36).substring(2, 7) + Math.random().toString(36).substring(2, 7);
}

// The minimum amount of time that has to pass before the speakserver closes the socket.
const MINWAIT = 100;

async function execute(message: any, regexResults: RegExpExecArray, extraRegex?: (RegExpExecArray|null)[]): Promise<TextCommandResult> {

	var lowerVoice = regexResults[1];
	if (lowerVoice == null) {
		lowerVoice = "one"
	}
	lowerVoice = lowerVoice.toLowerCase()

	if (find(["one", "misaka"], lowerVoice) < 0) {
		throw Error("Printable error: I don't recognize that voice.");
	}

	const filename = new Promise<string>((resolve, reject) => {
		const sock = createConnection({ host: speakServerHost, port: speakServerPort, timeout: 2.0}, () => {
			
			const start_time = Date.now();
			const res_filename = `./tmp/onespeech_${makeuuid()}.wav`;

			sock.once("close", () => {
				if(Date.now() - start_time < MINWAIT) {
					reject(Error(`Speakserver closed the socket early.`))
				} else {
					resolve(res_filename);
				}
			})
			
			// Model name (16 chars), autoregressive samples, diffusion iters, temperature, diffusion temperature, P value, length penalty, repetition penalty, conditioning free k, text (2048 chars)
			const buf = new ArrayBuffer(2096);
	
			writeStrIntoBuf(buf, lowerVoice, 0, 16);
	
			// Formatted like this to be more readable

			var samples = new Int32Array(buf, 16, 1); 			samples[0] = 16;
			var iters = new Int32Array(buf, 20, 1); 			iters[0] = 40;
			var temp = new Float32Array(buf, 24, 1);			temp[0] = 0.3;	
			var diff_temp = new Float32Array(buf, 28, 1);		diff_temp[0] = 1.0;
			var p = new Float32Array(buf, 32, 1);				p[0] = 1.0;
			var length_pen = new Float32Array(buf, 36, 1);		length_pen[0] = 1.0;
			var repetition_pen = new Float32Array(buf, 40, 1);	repetition_pen[0] = 2.0;
			var cond_k = new Float32Array(buf, 44, 1);			cond_k[0] = 2.0;
	
			writeStrIntoBuf(buf, regexResults[2], 48, 2048);
	
			const buf_as_buf = new Uint8Array(buf, 0, 2096);
	
			sock.write(buf_as_buf);

			sock.pipe(fs.createWriteStream(res_filename)
			.on("error", (e) => {reject(Error(`Could not save generated speech: ${e}`))})
			)
		});

		sock.on("error", (e) => {reject(Error(`Could not connect to speakserver: ${e}`))})

	})

	const file = new MessageAttachment(await filename);
	
	return { text: "Done.", files: [file], cleanup: [await filename] };
}

export { execute };