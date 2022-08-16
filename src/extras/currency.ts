import https from "https";
import { exchangerateApiKey, baseCurrency, currencyUpdateInterval } from "../config.json";
import { CachedJson } from "./file_stuff";

const CURRENCIES_PATH = "./database/currencies.json"

const currenciesCache= new CachedJson(CURRENCIES_PATH);

async function forceUpdateCurrencies() {
	let res: string = "";
	res = await new Promise((resolve, reject) => {
		https.get(`https://v6.exchangerate-api.com/v6/${exchangerateApiKey}/latest/${baseCurrency}`, (msg: any) => {
			msg.setEncoding("utf-8");
			let str = "";
			msg.on("data", (data: any) => { str += data; });
			msg.on("end", () => {resolve(str);});

		}).on("error", reject);
	});

	const jsonedRes = JSON.parse(res);

	if (jsonedRes.result != "success") throw Error(`Failed to get currencies: ${jsonedRes.result}`);

	const currencyData = currenciesCache.JSON;
	currencyData.currencies = jsonedRes.conversion_rates;
	currencyData.lastUpdated = (new Date(jsonedRes.time_last_update_unix * 1000)).toJSON();

	currenciesCache.write(currencyData);
	currenciesCache.reload();
}
function updateCurrencies() {
	const { lastUpdated } = currenciesCache.JSON;
	const now = new Date();
	const lastUpdatedDate = new Date(lastUpdated);
	const diff = now.getTime() - lastUpdatedDate.getTime();
	if (diff < currencyUpdateInterval) return diff;
	forceUpdateCurrencies();
	return 0;
}

export { updateCurrencies, CURRENCIES_PATH };