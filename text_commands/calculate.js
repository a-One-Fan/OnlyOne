const { units, translateChunk, chunkTypes, isNumeric, remove, stringifyChunk } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message, regexResults) {
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
			const conversionStack = [];
			for (const c of translated) {
				if (c.chunkType == chunkTypes.number) {
					polish.push(c);
					continue;
				}

				if (c.chunkType == chunkTypes.operator && ((conversionStack.length == 0) || (conversionStack[conversionStack.length - 1].chunkType == chunkTypes.openingBracket))) {
					conversionStack.push(c);
					continue;
				}

				if (c.chunkType == chunkTypes.openingBracket) {
					conversionStack.push(c);
					continue;
				}

				if (c.chunkType == chunkTypes.closingBracket) {
					while ((conversionStack.length > 0) && (conversionStack[conversionStack.length - 1].chunkType != chunkTypes.openingBracket)) {
						polish.push(conversionStack.pop());
					}
					if (conversionStack.length == 0) return { text: "You have an unopened closing bracket." };
					conversionStack.pop();
					continue;
				}


				let tempPriorityChunk = 0;
				if (c.priority) tempPriorityChunk = c.priority;
				let tempPriorityStack = 0;
				if (conversionStack[conversionStack.length - 1].priority) tempPriorityStack = conversionStack[conversionStack.length - 1].priority;

				while ((conversionStack.length > 0) && (tempPriorityChunk < tempPriorityStack)) {
					polish.push(conversionStack.pop());
					if (conversionStack.length > 0) {
						if (conversionStack[conversionStack.length - 1].priority) tempPriorityStack = conversionStack[conversionStack.length - 1].priority;
						else tempPriorityStack = 0;
					}
				}

				if (conversionStack.length == 0 || tempPriorityChunk > tempPriorityStack) {
					conversionStack.push(c);
					continue;
				}

				if (c.righty) {
					polish.push(conversionStack.pop());
				}

				conversionStack.push(c);

			}

			let ignoredOpenBrackets = 0;
			while (conversionStack.length > 0) {
				const stk = conversionStack.pop();
				if (stk.chunkType == chunkTypes.openingBracket) {
					ignoredOpenBrackets++;
				} else {
					polish.push(stk);
				}
			}
			if (ignoredOpenBrackets > 0) {
				resText += `You had ${ignoredOpenBrackets} unclosed opening bracket${ignoredOpenBrackets == 1 ? "" : "s"}, but I'll pretend I didn't see ${ignoredOpenBrackets == 1 ? "it" : "them"}.\n`;
			}

		} else {
			polish = translated;
		}

		const stack = [];

		for (let i = 0; i < polish.length; i++) {
			if (polish[i].chunkType == chunkTypes.openingBracket || polish[i].chunkType == chunkTypes.closingBracket) return { text: "You can't use brackets in polish notation." };
			if (polish[i].chunkType == chunkTypes.number) {
				stack.push(polish[i]);
				// TODO: do this better?
			} else if (polish[i].args == 1) {
				if (stack.length < 1) return { text: resText + "You used too many operators and not enough numbers." };
				stack.push(polish[i].op(stack.pop()));
			} else {
				if (stack.length < 2) return { text: resText + "You used too many operators and not enough numbers." };
				const top1 = stack.pop();
				const top2 = stack.pop();
				const val = polish[i].op(top2, top1);
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

		return { text: resText + stringifyChunk(stack[0]) };
	},
};