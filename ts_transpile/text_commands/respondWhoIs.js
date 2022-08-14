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
                responses = ["Me.", "You.", "Two.", "Three.", "Four.", "Five.", "Zero.", "No one.", "You!", "Not me."];
            }
            else {
                responses = ["Please give me plural whoIs responses :("];
            }
            return { text: pickRandom(responses) };
        });
    },
};
