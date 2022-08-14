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
const commandData = require("./commands.json");
const { clamp } = require("../extras/math_stuff.js");
const commandsPerPage = 8;
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let page = 1;
            if (regexResults[1])
                page = parseInt(regexResults[1]);
            const fakePage = page;
            page = clamp(1, Math.ceil(commandData.commands.length / commandsPerPage), page);
            const commandsStart = clamp(0, commandData.commands.length - 1, (page - 1) * commandsPerPage);
            const commandsEnd = clamp(0, commandData.commands.length, page * commandsPerPage);
            let res = "";
            if (page == 1)
                res = "You may address me by \"One\", \"Lady One\", \"Oh Glorious One\", \"Dear One\" and such other names.\nThen, adressing me, you can ask me the following things:\n";
            for (let i = commandsStart; i < commandsEnd; i++) {
                const command = commandData.commands[i];
                if (!command.hidden)
                    res += `[${command.name}]: "${command.help}", ${command.description}\n`;
            }
            const fakePageStr = (page == fakePage) ? `${page}` : `"${fakePage}"`;
            res += `\n(Page ${fakePageStr}/${Math.ceil(commandData.commands.length / commandsPerPage)})`;
            return { text: res };
        });
    },
};
