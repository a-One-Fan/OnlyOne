import { TextCommandResult } from "./_commands";

async function execute(message: any, regexResults: RegExpExecArray, extraRegex?: (RegExpExecArray|null)[]): Promise<TextCommandResult> {

	return { text: "Done.", files: [] };
}

export { execute };