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
const { getWebpage } = require("../extras/networking_stuff.js");
module.exports = {
    execute(message, regexResults, extraRegex) {
        return __awaiter(this, void 0, void 0, function* () {
            const resHtmlWiki = yield getWebpage(`https://www.fandom.com/?s=${encodeURIComponent(regexResults[1])}`);
            const wiki = /<div class="mediawiki-article__content">\s*<a href="https:\/\/([a-zA-Z0-9]+)\.fandom\.com\/wiki/.exec(resHtmlWiki);
            if (!wiki) {
                throw Error(`Printable error: I couldn't find a wiki called ${regexResults[1]}.`);
            }
            const resHtmlArticle = yield getWebpage(`https://${wiki[1]}.fandom.com/wiki/Special:Search?query=${encodeURIComponent(regexResults[2])}&scope=internal`);
            const article = /<h3 class="unified-search__result__header">\s*<a href="([^"]+)"/.exec(resHtmlArticle);
            if (!article) {
                throw Error(`Printable error: I couldn't find an article for ${regexResults[2]}`);
            }
            return { text: article[1] };
        });
    },
};
