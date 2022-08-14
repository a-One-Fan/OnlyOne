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
            const reg = regexResults[1];
            let resText = "";
            if (/two|tou/i.exec(reg) || /three/i.exec(reg) || /four?/i.exec(reg) || /five|faibu/i.exec(reg)) {
                resText = pickRandom(["She's fine.", "She's hungry.", "She's sad.", "She's going crazy...", "She's extra happy right now.",
                    "I don't know, I haven't seen her lately.", "She's cooking.", "She's trying to cook.", "She's having fun with the soldiers.",
                    "She's probably asleep, I'm not going to disturb her just to check on her as I'm sure she's fine by herself.",
                    "She's far away, and is supposed to be ruling her kingdom. I can't tell you more than that; I would hope she's doing it well, but I can't be certain."]);
                return { text: resText };
            }
            if (/one|wann|brother/i.exec(reg)) {
                resText = pickRandom(["He's fine.", "He's training.", "He's probably lonely again.", "He's busy poking that hole with his sword.",
                    "He's supposed to be reading right now.", "He's really teaching the training dummies a lesson.", "He's happy. He probably gets happy every time I visit him.",
                    "He's doing well."]);
                return { text: resText };
            }
            if (/[cz]ero(?:o?neesama)?/i.exec(reg)) {
                resText = pickRandom(["She's a monster, as always.", "She's someone I hope I'll get to kill soon.", "I don't know, and I plan to find out.",
                    "She's hopefully tripped and poked herself on her sword... That would save me from a lot of headaches.", "She's on my to-do list.",
                    "She's hiding, but not for long. I'm sure she'll show up and tell us how she is."]);
                return { text: resText };
            }
            resText = pickRandom(["Fine.", "Delicious.", "Disgusting.", "Very, very annoying.", "Pretty well; makes me smile. 🙂", "Somewhat smelly. Wash it.",
                "I don't really care enough to be able to tell you, sorry.", "Exceptionally good."]);
            return { text: resText };
        });
    },
};