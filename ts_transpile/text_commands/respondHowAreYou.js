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
            const responses = ["I'm doing fine, thanks for asking.", "I'm fine.", "I'm feeling slightly happier right now. I haven't felt like that in a while.",
                "I'm not feeling particularly great, sorry.", "I'm peeved.", "I'm feeling uneasy right now.",
                "I'm glad you're concerned about me. I'm alright."];
            return { text: responses[Math.floor(Math.random() * responses.length)] };
        });
    },
};
