const https = require("https");
const { exchangerateApiKey, baseCurrency, currencyUpdateInterval } = require("../config.json");
const fs = require("fs");

module.exports = {
	async forceUpdateCurrencies() {
		let res = [];
		res = await new Promise((resolve, reject) => {
			https.get(`https://v6.exchangerate-api.com/v6/${exchangerateApiKey}/latest/${baseCurrency}`, (msg) => {
				msg.setEncoding("utf-8");
				let str = "";
				msg.on("data", (data) => { str += data; });
				msg.on("end", () => {resolve(str);});

			}).on("error", reject);
		});

		const jsonedRes = JSON.parse(res);
		const currencyData = require("./currencies.json");

		if (jsonedRes.result != "success") throw Error(`Failed to get currencies: ${jsonedRes.result}`);

		currencyData.currencies = jsonedRes.conversion_rates;
		currencyData.lastUpdated = (new Date(jsonedRes.time_last_update_unix * 1000)).toJSON();

		fs.writeFileSync("./extras/currencies.json", JSON.stringify(currencyData, null, 2));
	},
	updateCurrencies() {
		delete require.cache[require.resolve("./currencies.json")];
		const { lastUpdated } = require("./currencies.json");
		const now = new Date();
		const lastUpdatedDate = new Date(lastUpdated);
		if ((now - lastUpdatedDate) < currencyUpdateInterval) return now - lastUpdatedDate;
		module.exports.forceUpdateCurrencies();
		return 0;
	},
};