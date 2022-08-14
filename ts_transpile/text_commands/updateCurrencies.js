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
const { updateCurrencies } = require("../extras/currency.js");
const { currencyUpdateInterval } = require("../config.json");
module.exports = {
    execute(message, regexResults) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateRes = updateCurrencies();
            return { text: updateRes == 0 ? "I've updated my currency conversion rates." : `Not enough time has passed for me to update my currency conversion rates.\nSpecifically, ${updateRes / 1000} seconds have passed, I will wait for ${(currencyUpdateInterval - updateRes) / 1000} more seconds.` };
        });
    },
};
