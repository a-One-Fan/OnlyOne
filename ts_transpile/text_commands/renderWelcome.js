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
const { renderWelcome } = require("../extras/render_stuff.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            const renderParams = {};
            if (regexResults[1]) {
                renderParams.scene = regexResults[1];
            }
            if (regexResults[2]) {
                renderParams.userMention = regexResults[2];
            }
            if (regexResults[3]) {
                renderParams.hideText = true;
            }
            const link = yield getLinkFromText(regexResults[4], message);
            const renderResult = yield renderWelcome(link, renderParams);
            renderResult.text = "Here's your customized welcome(-ish?) image.";
            return renderResult;
        });
    },
};
