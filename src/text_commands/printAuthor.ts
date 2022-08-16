import * as reacts from "../configurables/message_reacts";
import * as parses from "../configurables/valid_message";
import * as errors from "../configurables/error_message";

async function execute(message: any, regexResults: RegExpExecArray) {
	const row = await message.client.db.findOne({ where: { userID: message.author.id } });

	const reactTypeText = "I will " + reacts.reactTypes[row.reactType].name;

	const parseTypeText = parses.parseTypes[row.parseType].name;

	const errorTypeText = errors.errorTypes[row.errorType].name;

	const res = `You have said my name a total of ${row.lowerOne + row.upperOne} times (${row.upperOne} capitalized ${row.reputation > 5.0 ? "" : "correctly"} and ${row.lowerOne} not),\n` +
	`you've said the digit "1" ${row.digitOne} times and you've mentioned me with other names ${row.otherOne} times. Your reputation is ${row.reputation}${row.reputation > 5.0 ? "!" : "."}\n` +
	`${reactTypeText} (type ${row.reactType}), with a ${row.reactChance * 100.0}% chance (${row.reactChance})${row.reputation > 5.0 ? "!" : "."}\n` +
	`I will consider as a valid text command ${parseTypeText}. (type ${row.parseType})\n` +
	`When an error occurs, I will respond with ${errorTypeText}. (type ${row.errorType})\n`;

	return { text: res };
}

export { execute };