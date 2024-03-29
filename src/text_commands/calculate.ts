import { translateChunk, chunkTypes, isNumeric, remove, stringifyChunk, convertInfix, MathExpressionChunk } from "../extras/math_stuff";

async function execute(message: any, regexResults: RegExpExecArray) {
	let resText = "";
	let padded = "";
	let prevCharNumeric = false;
	for (const c of regexResults[2]) {
		if (c == "(" || c == ")") {
			padded += ` ${c} `;
			continue;
		}
		if (c == "\n") {
			padded += " ";
			continue;
		}
		if (isNumeric(c) != prevCharNumeric) padded += " ";
		prevCharNumeric = isNumeric(c);
		padded += c;
	}

	let split = padded.split(RegExp("\\s+"));
	split = remove(split, "");
	split = remove(split, "to");

	const translated = [];
	let polish = [];

	for (const chunk of split) {
		translated.push(translateChunk(chunk));
	}

	if (!regexResults[1]) {
		let ignoredOpenBrackets, ignoredClosingBrackets;
		[polish, ignoredOpenBrackets, ignoredClosingBrackets] = convertInfix(translated);

		if (ignoredOpenBrackets > 0 || ignoredClosingBrackets > 0) {
			resText += "You had ";
			if (ignoredOpenBrackets > 0) resText += `${ignoredOpenBrackets} unclosed opening bracket${ignoredOpenBrackets == 1 ? "" : "s"}`;
			if (ignoredClosingBrackets > 0 && ignoredOpenBrackets > 0) resText += " and ";
			if (ignoredClosingBrackets > 0) resText += `${ignoredClosingBrackets} unopened closing bracket${ignoredClosingBrackets == 1 ? "" : "s"}`;
			resText += `, but I'll pretend I didn't see ${ignoredClosingBrackets + ignoredOpenBrackets == 1 ? "it" : "them"}.\n`;
			if (ignoredClosingBrackets > 0) resText += "Unopened closing brackets may result in further, 'incorrect' errors down the line.\n";
		}

	} else {
		polish = translated;
	}

	// TODO: move more of this into math_stuff?
	const stack: MathExpressionChunk[] = [];

	for (let i = 0; i < polish.length; i++) {
		if (polish[i].chunkType == chunkTypes.openingBracket || polish[i].chunkType == chunkTypes.closingBracket) return { text: "You can't use brackets in polish notation." };
		if (polish[i].chunkType == chunkTypes.number) {
			stack.push(polish[i]);
			// TODO: do this better?
		} else if (polish[i].args == 1) {
			if (stack.length < 1) return { text: resText + "You used too many operators and not enough numbers." };
			// !! More TS fail,  ^     \/ this can't be undefined!!!
			const op = polish[i].op
			stack.push((op as any)(stack.pop() as MathExpressionChunk));
		} else {
			if (stack.length < 2) return { text: resText + "You used too many operators and not enough numbers." };
			const top1 = stack.pop() as MathExpressionChunk;
			const top2 = stack.pop() as MathExpressionChunk;
			const op = polish[i].op
			const val = (op as any)(top2, top1);
			stack.push(val);
		}
	}

	if (stack.length > 1) {
		let remains = "";
		for (let i = 0; i < (stack.length - 1); i++) {
			remains += stringifyChunk(stack[i]) + ", ";
		}
		remains += stringifyChunk(stack[stack.length - 1]) + "\n";
		return { text: resText + `You didn't use enough operators. What remains is:\n${remains}` };
	}
	if (stack.length == 0) return { text: resText + "How did you leave an empty stack?!" };

	return { text: resText + stringifyChunk(stack[0]) + "." };
}

export { execute };