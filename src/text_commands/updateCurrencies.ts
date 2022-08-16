import { updateCurrencies } from "../extras/currency";
import { currencyUpdateInterval } from "../config.json";
import { TextCommandResult } from "./_commands";

async function execute(message: object, regexResults: RegExpMatchArray): Promise<TextCommandResult> {

	const updateRes = updateCurrencies();
	
	return { text: updateRes == 0 ? "I've updated my currency conversion rates." : `Not enough time has passed for me to update my currency conversion rates.\nSpecifically, ${updateRes / 1000} seconds have passed, I will wait for ${(currencyUpdateInterval - updateRes) / 1000} more seconds.` };
}

export { execute }