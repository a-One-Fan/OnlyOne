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
const { currentCols } = require("../extras/database_stuff.js");
const { getUserFromText } = require("../extras/text_recognition.js");
const { ownerId } = require("../config.json");
module.exports = {
    execute(message, regexResults, extraRegex) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield getUserFromText(regexResults[1], message);
            if (!user)
                throw Error(`Printable error: Could not find user by ${regexResults[1]}`);
            if (user.id == ownerId && message.author.id != ownerId)
                throw Error("Printable error: You can't change the owner's properties.");
            if (!currentCols[regexResults[2]])
                throw Error(`Printable error: No column ${regexResults[2]} exists.`);
            if (regexResults[2] == "userID")
                throw Error("Printable error: You can't change that column because it would cause too many headaches. Maybe the ORM won't allow it either");
            const row = yield message.client.db.findOne({ where: { userID: user.id } });
            const newval = regexResults[3] ? regexResults[3] : regexResults[4];
            const newprop = {};
            newprop[regexResults[2]] = newval;
            yield message.client.db.update(newprop, { where: { userID: user.id } });
            return { text: `Updated ${regexResults[2]} for user "${user.displayName}" (${user.id}) from [${row[regexResults[2]]}] to [${newval}]` };
        });
    },
};
