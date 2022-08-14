"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-check
const https = require("https");
const fs = require("fs");
const { permittedUrls, downloadFilepath } = require("../config.json");
module.exports = {
    getWebpage(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let resHtml = new Promise((resolve, reject) => {
                https.get(address, (res) => {
                    let totalData = "";
                    if (res.statusCode === 200) {
                        res.on("data", (d) => {
                            totalData += d;
                        })
                            .once("close", () => resolve(totalData));
                    }
                    else {
                        reject(Error(`Request failed with status code: ${res.statusCode} while trying to get webpage`));
                    }
                });
            });
            resHtml = yield resHtml;
            return resHtml;
        });
    },
    getRedirect(address) {
        return __awaiter(this, void 0, void 0, function* () {
            let resRedirect = new Promise((resolve, reject) => {
                https.get(address, (res) => {
                    if (res.statusCode == 302) {
                        resolve(res.headers.location);
                    }
                    else {
                        reject(Error(`Request failed with status code: ${res.statusCode} while trying to get a redirect`));
                    }
                });
            });
            resRedirect = yield resRedirect;
            return resRedirect;
        });
    },
    downloadImage(url, filepath = downloadFilepath) {
        return new Promise((resolve, reject) => {
            const regexResult = RegExp(permittedUrls).exec(url);
            if (!regexResult) {
                return reject(new Error("Bad URL: " + url));
            }
            const extensionlessPath = filepath;
            filepath = filepath + "." + regexResult[1];
            https.get(url, (msg) => {
                if (msg.statusCode === 200) {
                    msg.pipe(fs.createWriteStream(filepath))
                        .on("error", reject)
                        .once("close", () => resolve([extensionlessPath, regexResult[1]]));
                }
                else {
                    msg.resume();
                    reject(new Error(`Request failed with status code: ${msg.statusCode}`));
                }
            });
        });
    },
};
