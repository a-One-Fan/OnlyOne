import { TextCommandResult } from "./text_command_utils";

async function execute(message: any, regexResults: RegExpExecArray, extraRegex?: (RegExpExecArray|null)[]): Promise<TextCommandResult> {

	return { text: "Done.", files: [] };
}

export { execute };