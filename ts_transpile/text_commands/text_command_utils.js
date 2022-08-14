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
const commandData = require("../text_commands/commands.json");
const { errorChoose } = require("../configurables/error_message.js");
const { parseChoose } = require("../configurables/valid_message.js");
module.exports = {
    findCommand(text) {
        for (const command of commandData.commands) {
            const regexRes = RegExp(command.regex, command.regexParams).exec(text);
            if (regexRes) {
                const extraRes = [];
                if (command.extraRegex) {
                    for (const extraRegex of command.extraRegex) {
                        extraRes.push(RegExp(extraRegex, command.regexParams).exec(text));
                    }
                }
                const func = require("../text_commands/" + command.name + ".js");
                return [func, regexRes, extraRes, command];
            }
        }
        return undefined;
    },
    executeCommand(message, errorType, parseType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (errorType == undefined || parseType == undefined) {
                const row = yield message.client.db.findOne({ where: { userID: message.author.id } });
                if (errorType == undefined)
                    errorType = row.errorType;
                if (parseType == undefined)
                    parseType = row.parseType;
            }
            const parsed = parseChoose(message.content, parseType);
            if (!parsed || !parsed.valid)
                return {};
            let err = undefined, commandRes = undefined, foundCommand = undefined;
            const res = module.exports.findCommand(parsed.culledText);
            const row = yield message.client.db.findOne({ where: { userID: message.author.id } });
            if (res) {
                const [func, regexRes, extraRes, _foundCommand] = res;
                foundCommand = _foundCommand;
                if (foundCommand.rank && row.rank < foundCommand.rank) {
                    err = { message: `Printable error: Your rank (${row.rank}) is too low to execute this command (${foundCommand.rank}).` };
                }
                else {
                    try {
                        commandRes = yield func.execute(message, regexRes, extraRes);
                    }
                    catch (error) {
                        err = error;
                        console.log(err);
                    }
                }
            }
            // TODO: DM the error to me? :)
            const errorRes = errorChoose(err, foundCommand, errorType);
            return commandRes ? commandRes : errorRes;
        });
    },
    mergeMessagePayload(obj1, obj2) {
        const newObj = { text: "", files: [], reacts: [], embeds: [] };
        for (const prop in newObj) {
            if (obj1[prop])
                newObj[prop].concat(obj1[prop]);
            if (obj2[prop])
                newObj[prop].concat(obj2[prop]);
        }
        return newObj;
    },
    decoupleMessageReacts(obj) {
        const newObj = { text: obj.text, files: obj.files, embeds: obj.embeds };
        return [obj.reacts, newObj];
    },
};
