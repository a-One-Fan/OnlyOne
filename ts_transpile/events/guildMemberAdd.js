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
const { userJoinChannelsFilepath } = require("../config.json");
const { renderWelcome } = require("../extras/render_stuff.js");
const { pickRandom } = require("../extras/math_stuff");
const { rm, readFileSync } = require("fs");
module.exports = {
    name: "guildMemberAdd",
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = JSON.parse(readFileSync(userJoinChannelsFilepath));
            const channelId = channels.servers[member.guild.id];
            let channel = undefined;
            if (channelId && !channelId.disabled) {
                channel = member.client.channels.cache.get(channelId);
                if (!channel) {
                    return;
                }
            }
            else {
                return;
            }
            const link = member.displayAvatarURL({ format: "png" });
            const renderResult = yield renderWelcome(link, { userMention: `@${member.displayName}` });
            const text = `Welcome to the ${pickRandom(["not-Toaru", "not-quite-Utahime", "One", "not-Railgun", "not-Raildex", "OnlyOne"])} server, <@${member.id}>!`;
            yield channel.send({ content: text, files: renderResult.files });
            rm(renderResult.cleanup, { recursive: true, force: true }, (err) => { if (err)
                console.log("Got error while deleting:", err); });
        });
    },
};
