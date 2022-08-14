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
            const responses = ["I'm glad that you are.", "Alright.", "Good for you.",
                "That doesn't sound good.", "I hope you're not in the future.", "Too bad...", "I'm busy right now.",
                "Please ask me another time.", "That you are.", `Are you hoping for a "Hello [${regexResults[1].substring(0, 8)}...], I'm One!" ?\nYou're not going to get that from me.`,
                "I regret reading your message.", "I'm happy I read that."];
            return { text: pickRandom(responses) };
        });
    },
};
