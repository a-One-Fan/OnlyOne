const { updateCurrencies } = require("../extras/currency");
const { currencyUpdateInterval } = require("../config.json");
const { TextComamndResult } = require("./text_command_utils");

module.exports = {
	async execute(message: object, regexResults: RegExpMatchArray): Promise<typeof TextComamndResult> {

		const updateRes = updateCurrencies();
		const cls = TextComamndResult();
		return { text: updateRes == 0 ? "I've updated my currency conversion rates." : `Not enough time has passed for me to update my currency conversion rates.\nSpecifically, ${updateRes / 1000} seconds have passed, I will wait for ${(currencyUpdateInterval - updateRes) / 1000} more seconds.` };
	},
};