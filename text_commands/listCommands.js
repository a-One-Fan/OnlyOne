const commands = require("./commands.json");

module.exports = {
	async execute(message, regexResults) {
		let res = "You can ask me the following things:\n";
		for (const command of commands) {
			res += `"${command.help}", ${command.description}\n`;
		}
		return res;
	},
};