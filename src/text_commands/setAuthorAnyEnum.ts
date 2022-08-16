import * as reactTypes from "../configurables/message_reacts";
import * as parseTypes from "../configurables/valid_message";
import * as errorTypes from "../configurables/error_message";

const enums: [typeof reactTypes, typeof parseTypes, typeof errorTypes] = [reactTypes, parseTypes, errorTypes];
const enumNames = ["reactType", "parseType", "errorType"];
const enumPrintNames = ["reaction", "valid command messages", "error handling"];

async function execute(message: any, regexResults: RegExpExecArray) {
	let enumID = 0;
	for (let i = 0; i < enums.length; i++) {
		if (regexResults[i + 1]) {
			enumID = i;
			break;
		}
	}

	const type = parseInt(regexResults[1 + enums.length]);


	if (type < 0 || type >= (enums[enumID] as any).length) {
		return { text: `"${type}" isn't a valid number. Please use a valid number.\n` };
	}

	const newprop: any = {};
	newprop[enumNames[enumID]] = type;
	await message.client.db.update(newprop, { where: { userID: message.author.id } });
	return { text: `I've set your ${enumPrintNames[enumID]} type to '${(enums[enumID] as any)[type].name}' (${type}) from here on.\n` };
}

export { execute };