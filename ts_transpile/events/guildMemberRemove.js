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
const { readFileSync } = require("fs");
module.exports = {
    name: "guildMemberRemove",
    execute(member) {
        return __awaiter(this, void 0, void 0, function* () {
            const channels = JSON.parse(readFileSync(userJoinChannelsFilepath));
            const channelId = channels.servers[member.guild.id];
            console.log(`User left guild ${member.guild.id}, trying to post to channel ${channelId}`);
            if (channelId && !channelId.disabled) {
                const channel = member.client.channels.cache.get(channelId);
                if (channel) {
                    channel.send(`<@${member.id}> ("${member.displayName}") has left us.`);
                }
            }
        });
    },
};
