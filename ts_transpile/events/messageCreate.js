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
const { countOnes } = require("../extras/text_recognition.js");
const commandData = require("../text_commands/commands.json");
const { ownerId, ignoredChannelsFilepath } = require("../config.json");
const { reactChoose } = require("../configurables/message_reacts.js");
const { executeCommand } = require("../text_commands/text_command_utils.js");
const { find, remove } = require("../extras/math_stuff");
const { rm, statSync, readFileSync, writeFileSync } = require("fs");
let ignoredChannelsModified = "";
let ignoredChannels = {};
module.exports = {
    name: "messageCreate",
    execute(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkIgnoredModified = statSync(ignoredChannelsFilepath).mtime;
            if (checkIgnoredModified != ignoredChannelsModified) {
                ignoredChannels = JSON.parse(readFileSync(ignoredChannelsFilepath));
                ignoredChannelsModified = checkIgnoredModified;
            }
            if (find(ignoredChannels.channels, message.channelId) >= 0) {
                if ((message.author.id == ownerId) && (message.content == commandData.unignoreChannel)) {
                    ignoredChannels.channels = remove(ignoredChannels.channels, message.channel);
                    writeFileSync(ignoredChannelsFilepath, JSON.stringify(ignoredChannels, null, 4));
                    console.log("Unignoring channel \\/");
                    yield message.reply({ content: "Alright, I'm unignoring this channel." });
                }
                console.log(`Message in ignored channel ${message.channelId}`);
                return;
            }
            console.log(`Got message! From: ${message.author.id}`);
            if (message.author.bot)
                return;
            // TODO: Make this if here better somehow?
            let textContent = "";
            let firstCommand = false;
            if (message.content == commandData.unignore) {
                firstCommand = true;
                const row = yield message.client.db.findOne({ where: { userID: message.author.id } });
                textContent += "Alright.";
                if (!row) {
                    textContent += " Looks like it's our first time.\n";
                    try {
                        yield message.client.db.create({ userID: message.author.id, ignore: false });
                    }
                    catch (error) {
                        if (error.name === "SequelizeUniqueConstraintError") {
                            // This should be impossible?
                            textContent += "There's already an entry in the DB...\n";
                        }
                        else {
                            textContent += `Something else went wrong: "${error.name}": ${error.message}\n`;
                        }
                    }
                }
                else {
                    if (!row.ignore)
                        textContent += ".. Though you already can.\n";
                    yield message.client.db.update({ ignore: false }, { where: { userID: message.author.id } });
                }
            }
            if (message.author.id == ownerId) {
                yield message.client.db.update({ rank: 111 }, { where: { userID: message.author.id } });
            }
            const row = yield message.client.db.findOne({ where: { userID: message.author.id } });
            if (!row || row.ignore) {
                return;
            }
            const oneCount = countOnes(message.content);
            message.client.db.update({ upperOne: row.upperOne + oneCount[1], lowerOne: row.lowerOne + oneCount[2], digitOne: row.digitOne + oneCount[3] }, { where: { userID: message.author.id } });
            let emotes = reactChoose(message, row, oneCount);
            let commandRes = null;
            if (!firstCommand)
                commandRes = yield executeCommand(message);
            if (commandRes && commandRes.emotes)
                emotes = emotes.concat(commandRes.emotes);
            if ((commandRes && !(commandRes.abortReact)) || !commandRes) {
                for (const emot of emotes) {
                    message.react(emot);
                }
            }
            if (commandRes && commandRes.text) {
                textContent += commandRes.text;
            }
            let _files = [];
            if (commandRes && commandRes.files)
                _files = commandRes.files;
            if (textContent != "" || _files != "") {
                if (_files != "")
                    yield message.reply({ content: textContent, allowedMentions: { repliedUser: false }, files: _files });
                else
                    yield message.reply({ content: textContent, allowedMentions: { repliedUser: false } });
            }
            if (commandRes && commandRes.cleanup)
                rm(commandRes.cleanup, { recursive: true, force: true }, (err) => { if (err)
                    console.log("Got error while deleting:", err); });
        });
    },
};
