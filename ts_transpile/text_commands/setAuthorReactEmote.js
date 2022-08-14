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
module.exports = {
    execute(message, regexResults, extraRegex) {
        return __awaiter(this, void 0, void 0, function* () {
            if (regexResults[1]) {
                yield message.client.db.update({ customReact: null }, { where: { userID: message.author.id } });
                return { text: "I've reset your react emote. I might use the old one one last time." };
            }
            if (!regexResults[2]) {
                return { text: "You need to specify an ID." };
            }
            try {
                yield message.react(regexResults[2]);
            }
            catch (error) {
                // Don't catch this and instead use the special error-catching code?
                return { text: "I can't react using that emote, sorry." };
            }
            yield message.client.db.update({ customReact: regexResults[1] }, { where: { userID: message.author.id } });
            return { text: `I've set your custom react emote to "${regexResults[1]}".` };
        });
    },
};
