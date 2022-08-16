import * as reacts from "../configurables/message_reacts";
import * as parses from "../configurables/valid_message";
import * as errors from "../configurables/error_message";

const enums = [reacts.reactTypes, parses.parseTypes, errors.errorTypes];
const listText = [reacts.listText, parses.listText, errors.listText];

function execute(message: any, regexResults: RegExpExecArray) {
	let enumID = 0;
	for (let i = 0; i < enums.length; i++) {
		if (regexResults[i + 1]) {
			enumID = i;
			break;
		}
	}

	let res = listText[enumID] + ":\n";

	for (const [i, type] of enums[enumID].entries()) {
		const nameCap = type.name[0].toUpperCase() + type.name.substring(1);
		res += `${i}: ${nameCap}.\n`;
	}

	if (enumID == 0) res += "Keep in mind that you can change your reaction chance as well.\n";

	return { text: res };
}

export { execute };