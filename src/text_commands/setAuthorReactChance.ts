async function execute(message: any, regexResults: RegExpExecArray) {
	let chance = parseFloat(regexResults[1]);
	if (regexResults[1][regexResults[1].length - 1] == "%") chance = chance * 0.01;

	if (chance > 1) return { text: "That chance is too high." };
	if (chance < 0) return { text: "That chance is too low." };
	if (Math.sign(1 / chance) == -1) return { text: "Nice try, but I can tell when you write a negative zero, and I really don't like having any 'Zero's around.\nEspecially not negative ones." };

	await message.client.db.update({ reactChance: chance }, { where: { userID: message.author.id } });
	return { text: `Alright, I've set your reaction chance to ${chance * 100.0}% (${chance})` };
}

export { execute };