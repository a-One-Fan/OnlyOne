const { units, translateChunk, chunkTypes, isNumeric, remove } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message, regexResults) {
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

				if (c.chunkType == chunkTypes.operator && (conversionStack.length == 0 || conversionStack[conversionStack.length - 1].chunkType == chunkTypes.closingBracket)) {
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

				// TODO? Some associativity check here?
				conversionStack.push(c);

			}

			while (conversionStack.length > 0) polish.push(conversionStack.pop());

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
				if (stack.length < 1) return { text: "You used too many operators and not enough numbers." };
				stack.push(polish[i].op(stack.pop()));
			} else {
				if (stack.length < 2) return { text: "You used too many operators and not enough numbers." };
				const top1 = stack.pop();
				const top2 = stack.pop();
				const val = polish[i].op(top2, top1);
				stack.push(val);
			}
		}

		if (stack.length > 1) {
			let remains = "";
			for (let i = 0; i < (stack.length - 1); i++) {
				remains += `${stack[i].value} ${stack[i].unit.names[stack[i].unit.names.length - 1]}, `;
			}
			remains += `${stack[stack.length - 1].value} ${stack[stack.length - 1].unit.names[stack[stack.length - 1].unit.names.length - 1]}\n`;
			return { text: `You didn't use enough operators. What remains is:\n${remains}` };
		}
		if (stack.length == 0) return { text: "How did you leave an empty stack?!" };

		return { text: `${stack[0].value}${stack[0].unit == units.untyped ? "" : ` ${stack[0].unit.names[stack[0].unit.names.length - 1]}.` }` };
	},
};