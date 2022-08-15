const { TextComamndResult } = require("./text_command_utils");

module.exports = {
	async execute(message: any, regexResults: string[], extraRegex?: string[][]): Promise<typeof TextComamndResult> {

		return { text: "Done.", files: [] };
	},
};