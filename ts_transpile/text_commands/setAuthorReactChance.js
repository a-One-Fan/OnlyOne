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
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let chance = parseFloat(regexResults[1]);
            if (regexResults[1][regexResults[1].length - 1] == "%")
                chance = chance * 0.01;
            if (chance > 1)
                return { text: "That chance is too high." };
            if (chance < 0)
                return { text: "That chance is too low." };
            if (Math.sign(1 / chance) == -1)
                return { text: "Nice try, but I can tell when you write a negative zero, and I really don't like having any 'Zero's around.\nEspecially not negative ones." };
            yield message.client.db.update({ reactChance: chance }, { where: { userID: message.author.id } });
            return { text: `Alright, I've set your reaction chance to ${chance * 100.0}% (${chance})` };
        });
    },
};
