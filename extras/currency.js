const { https } = require("https");
const { exchangerateApiKey, baseCurrency, currencyUpdateInterval } = require("../config.json");
const { fs } = require("fs");

module.exports = {
	forceUpdateCurrencies() {
		https.fetch(`https://v6.exchangerate-api.com/v6/${exchangerateApiKey}/latest/${baseCurrency}`)
			.then(res => {
				const jsonedRes = JSON.parse(res);
				const currencyData = require("./extras/currencies.json");

				if (jsonedRes.result != "success") throw Error(`Failed to get currencies: ${jsonedRes.result}`);

				currencyData.currencies = jsonedRes.conversion_rates;
				currencyData.lastUpdated = Date(jsonedRes.time_last_update_unix * 1000).toJSON();

				fs.writeFileSync("./extras/currencies.json", currencyData.stringify());
			});
	},
	updateCurrencies() {
		const { lastUpdated } = require("./extras/currencies.json");
		const now = new Date();
		const lastUpdatedDate = new Date(lastUpdated);
		if ((now - lastUpdatedDate) < currencyUpdateInterval) return now - lastUpdatedDate;
		module.exports.forceUpdateCurrencies();
		return 0;
	},
};