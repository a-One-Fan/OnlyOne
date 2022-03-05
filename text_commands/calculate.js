const { units, translateChunk } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message, regexResults) {
		const split = regexResults[2].split(RegExp("\\s+"));

		const translated = [];
		let polish = [];

		for (const chunk of split) {
			translated.push(translateChunk(chunk));
		}

		if (!regexResults[1]) {
			return { text: "Sorry, infix calculations aren't implemented yet. Learn to use reverse polish notation (aka postfix) yourself!" };
		} else {
			polish = translated;
		}

		const stack = [];

		for (let i = 0; i < polish.length; i++) {
			if (polish[i].isNumber) {
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