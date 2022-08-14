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
const { pickRandom } = require("../extras/math_stuff.js");
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            let responses = [];
            if (regexResults[1] == "is" || regexResults[1] == "'s" || regexResults[1] == "s") {
                responses = ["1.", "11.", "10.", "A dog.", "A cat.", "A dragon.", "My dragon friend.", "It's pointless.", "It's crazy.", "It's stupid.",
                    "It's mildly annoying.", "It's something I don't really care about.", "It's the worst I've had the displeasure of seeing.",
                    "It's the best I've seen, so far.", "It's simply great.", "It's terrible.", "It's nice.",
                    "It's disgusting and disfigured, and does not redeem itself for those qualities.", "It smells nice."];
            }
            else {
                responses = ["They're stupid.", "They're somewhere they should not be."];
            }
            return { text: pickRandom(responses) };
        });
    },
};
