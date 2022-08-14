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
const { commands } = require("./commands.json");
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let command = [];
            for (const c of commands) {
                if (c.name == regexResults[1]) {
                    command = c;
                    break;
                }
            }
            if (command == []) {
                return { text: `Could not find command "${regexResults[1]}".` };
            }
            let resText = "";
            resText += `[${command.name}]\nSay "${command.help}" to trigger the command.\n${command.description}\n`;
            if (command.extraHelp) {
                resText += command.extraHelp;
            }
            return { text: resText };
        });
    },
};
