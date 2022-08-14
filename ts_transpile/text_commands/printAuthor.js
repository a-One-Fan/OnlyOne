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
const reacts = require("../configurables/message_reacts.js");
const parses = require("../configurables/valid_message.js");
const errors = require("../configurables/error_message.js");
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            const row = yield message.client.db.findOne({ where: { userID: message.author.id } });
            const reactTypeText = "I will " + reacts.reactTypes[row.reactType].name;
            const parseTypeText = parses.parseTypes[row.parseType].name;
            const errorTypeText = errors.errorTypes[row.errorType].name;
            const res = `You have said my name a total of ${row.lowerOne + row.upperOne} times (${row.upperOne} capitalized ${row.reputation > 5.0 ? "" : "correctly"} and ${row.lowerOne} not),\n` +
                `you've said the digit "1" ${row.digitOne} times and you've mentioned me with other names ${row.otherOne} times. Your reputation is ${row.reputation}${row.reputation > 5.0 ? "!" : "."}\n` +
                `${reactTypeText} (type ${row.reactType}), with a ${row.reactChance * 100.0}% chance (${row.reactChance})${row.reputation > 5.0 ? "!" : "."}\n` +
                `I will consider as a valid text command ${parseTypeText}. (type ${row.parseType})\n` +
                `When an error occurs, I will respond with ${errorTypeText}. (type ${row.errorType})\n`;
            return { text: res };
        });
    },
};
