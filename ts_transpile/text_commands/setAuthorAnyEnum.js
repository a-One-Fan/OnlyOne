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
const { reactTypes } = require("../configurables/message_reacts.js");
const { parseTypes } = require("../configurables/valid_message.js");
const { errorTypes } = require("../configurables/error_message.js");
const enums = [reactTypes, parseTypes, errorTypes];
const enumNames = ["reactType", "parseType", "errorType"];
const enumPrintNames = ["reaction", "valid command messages", "error handling"];
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let enumID = 0;
            for (let i = 0; i < enums.length; i++) {
                if (regexResults[i + 1]) {
                    enumID = i;
                    break;
                }
            }
            const type = parseInt(regexResults[1 + enums.length]);
            if (type < 0 || type >= enums[enumID].length) {
                return { text: `"${type}" isn't a valid number. Please use a valid number.\n` };
            }
            const newprop = {};
            newprop[enumNames[enumID]] = type;
            yield message.client.db.update(newprop, { where: { userID: message.author.id } });
            return { text: `I've set your ${enumPrintNames[enumID]} type to '${enums[enumID][type].name}' (${type}) from here on.\n` };
        });
    },
};
