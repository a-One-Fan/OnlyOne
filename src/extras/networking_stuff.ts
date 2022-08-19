// @ts-check
import https from "https";
import fs from "fs";
import { permittedUrls, downloadFilepath } from "../config.json";

async function getWebpage(address: string) {
	let resHtml = new Promise<string>((resolve, reject) => {
		https.get(address, (res) => {
			let totalData = "";
			if (res.statusCode === 200) {
				res.on("data", (d) => {
					totalData += d;
				})
					.once("close", () => resolve(totalData));
			} else {
				reject(Error(`Request failed with status code: ${res.statusCode} while trying to get webpage`));
			}
		});
	});

	const resolved = await resHtml;

	return resolved;
}

async function getRedirect(address: string) {
	let resRedirect = new Promise<string>((resolve, reject) => {
		https.get(address, (res) => {
			if (res.statusCode == 302 && res.headers.location) {
				resolve(res.headers.location);
			} else {
				reject(Error(`Request failed with status code: ${res.statusCode} while trying to get a redirect, or headers have no location`));
			}
		});
	});

	const resolved = await resRedirect;

	return resolved;
}

function downloadImage(url: string, filepath = downloadFilepath): Promise<[string, string]> {
	return new Promise((resolve, reject) => {
		const regexResult = RegExp(permittedUrls).exec(url);
		if (!regexResult) {
			return reject(new Error("Bad URL: " + url));
		}
		const extensionlessPath = filepath;
		// TODO: get and set extension based on what the file actually is?
		const extRegexRes = /\.([a-zA-Z0-9]{1,9})(?:[\?#].*)$/.exec(url);
		let ext = ""
		if(extRegexRes) ext = extRegexRes[1];
		filepath = filepath + "." + ext;
		https.get(url, (msg) => {
			if (msg.statusCode === 200) {
				msg.pipe(fs.createWriteStream(filepath))
					.on("error", reject)
					.once("close", () => resolve([extensionlessPath, ext]));
			} else {
				msg.resume();
				reject(new Error(`Request failed with status code: ${msg.statusCode}`));
			}
		});
	});
}


export { getWebpage, getRedirect, downloadImage};