const commandData = require("./commands.json");

module.exports = {
	async execute(message, regexResults) {
		let res = "You may adress be my \"One\", \"Lady One\", \"Oh Glorious One\", \"Dear One\" and such other names.\nThen, adressing me, you can ask me the following things:\n";
		for (const command of commandData.commands) {
			res += `"${command.help}", ${command.description}\n`;
		}
		return { text: res };
	},
};