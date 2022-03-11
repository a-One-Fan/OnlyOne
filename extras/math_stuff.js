module.exports = {
	// Make resolution even so that h264 can properly encode.
	evenify(resolution) {
		resolution = [Math.floor(resolution[0]), Math.floor(resolution[1])];
		return [resolution[0] + resolution[0] % 2, resolution[1] + resolution[1] % 2];
	},
	clamp(min, max, val) {
		if (val == undefined) throw Error("No val to clamp!");
		if (val < min) return min;
		if (val > max) return max;
		return val;
	},
	pickRandom(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	},
	// Mismatched types will override one another.
	// Mismatched subtypes will attempt to use a special conversion function.
	// If none present, will fallback to value conversion.
	// Subtype-less units will match all other subtypes
	// Matching subtypes will get converted linearly via their value, if present
	units: {
		g: { value: 0.001, type: "weight", subtype: "metric weight", names: ["g", "gram", "grams"] },
		kg: { value: 1, type: "weight", subtype: "metric weight", names: ["kg", "kilogram", "kilograms", "kilos"] },
		t: { value: 1000, type: "weight", subtype: "metric weight", names: ["t", "ton", "tons"] },

		mm: { value: 0.001, type: "distance", subtype: "metric distance", names: ["mm", "milimetre", "mmilimeter", "milimeters", "milimetres"] },
		cm: { value: 0.01, type: "distance", subtype: "metric distance", names: ["cm", "centimetre", "centimeter", "centimeters", "centimetres"] },
		dm: { value: 0.1, type: "distance", subtype: "metric distance", names: ["dm", "decimetre", "decimeter", "decimeters", "decimetres"] },
		m: { value: 1, type: "distance", subtype: "metric distance", names: ["m", "metre", "meter", "meters", "metres"] },
		km: { value: 1000, type: "distance", subtype: "metric distance", names: ["km", "kilometer", "kilometre", "kilometers", "kilometres"] },
		in: { value: 0.0254, type: "distance", subtype: "imperial distance", names: ["in", "inch", "inches"] },
		ft: { value: 0.3048, type: "distance", subtype: "imperial distance", names: ["ft", "foot", "feet", "footfetish"] },
		yd: { value: 0.9144, type: "distance", subtype: "imperial distance", names: ["yd", "yard", "yards"] },
		mil: { value: 1609.344, type: "distance", subtype: "imperial distance", names: ["mil", "mile", "miles"] },

		c: { type: "heat", subtype: "metric heat", names: ["c", "celsius", "centigrade"] },
		f: { type: "heat", subtype: "imperial heat", names: ["f", "farenheit"] },

		ms: { value: 0.001, type: "time", names: ["ms", "millisecond", "milliseconds"] },
		s: { value: 1, type: "time", names: ["s", "second", "seconds"] },
		min: { value: 60, type: "time", names: ["min", "minute", "minutes"] },
		h: { value: 3600, type: "time", names: ["h", "hr", "hour", "hours"] },
		d: { value: 60 * 60 * 24, type: "time", names: ["d", "day", "days"] },
		mo: { value: 30.4375 * 60 * 60 * 24, type: "time", names: ["mo", "month", "months"] },
		y: { value: 365.25 * 60 * 60 * 24, type: "time", names: ["y", "year", "years"] },
		dec: { value: 10 * 365.25 * 60 * 60 * 24, type: "time", names: ["dec", "decade", "decades"] },
		century: { value: 100 * 365.25 * 60 * 60 * 24, type: "time", names: ["century", "centuries"] },

		rad: { value: 1, type: "angle", names: ["r", "rad", "rads", "radians"] },
		deg: { value: 180 / Math.PI, type: "angle", names: ["d", "deg", "degrees"] },

		bit: { value: 1.0 / 8.0, type: "bits", names: ["b", "bit", "bits"] },
		byte: { value: 1, type: "bits", names: ["B", "byte", "bytes"] },

		kb: { value: 1000, type: "bits", names: ["KB", "kB", "kilobyte", "kilobytes"] },
		kbit: { value: 125, type: "bits", names: ["Kb", "kb", "kbit", "kilobit", "kilobits"] },
		kibib: { value: 1024, type: "bits", names: ["KiB", "kiB", "kibibyte", "kibibytes"] },
		kibibit: { value: 128, type: "bits", names: ["Kib", "kib", "kibit", "kibibit", "kibibits"] },

		mb: { value: 1000000, type: "bits", names: ["MB", "mB", "megabyte", "megabytes"] },
		mbit: { value: 125000, type: "bits", names: ["Mb", "mb", "mbit", "megabit", "megabits"] },
		mebib: { value: 1048576, type: "bits", names: ["MeB", "meB", "mebibyte", "mebibytes"] },
		mebibit: { value: 131072, type: "bits", names: ["Meb", "meb", "mebit", "mebibit", "mebibits"] },

		gb: { value: 1000000000, type: "bits", names: ["GB", "gB", "gigabyte", "gigabytes"] },
		gbit: { value: 125000000, type: "bits", names: ["Gb", "gb", "gbit", "gigabit", "gigabits"] },
		gibib: { value: 8589934592, type: "bits", names: ["GiB", "giB", "gibibyte", "gibibytes"] },
		gibibit: { value: 134217728, type: "bits", names: ["Gib", "gib", "gibit", "gibibit", "gibibits"] },

		tb: { value: 1000000000000, type: "bits", names: ["TB", "tB", "terabyte", "terabytes"] },
		tbit: { value: 125000000000, type: "bits", names: ["Tb", "tb", "tbit", "terabit", "terabits"] },
		tebib: { value: 1099511627776, type: "bits", names: ["TeB", "teB", "tebibyte", "tebibytes"] },
		tebibit: { value: 137438953472, type: "bits", names: ["Teb", "teb", "tebit", "tebibit", "tebibits"] },


		untyped: { type: "untyped", names: ["un", "untype", "typeless", "untyped"] },
	},
	// TODO: how tf do you refer to default functions like + as a function? To assign to a variable?
	// TODO: trig functions
	operators: {
		plus: { args: 2, names: ["+", "plus"], op: (val1, val2) => { return val1 + val2; } },
		minus: { args: 2, names: ["-", "minus"], op: (val1, val2) => { return val1 - val2; } },
		times: { args: 2, names: ["*", "times"], op: (val1, val2) => { return val1 * val2; } },
		divide: { args: 2, names: ["/", "divide", "divided", "divideby", "dividedby"], op: (val1, val2) => { return val1 / val2; } },
		power: { args: 2, names: ["^", "**", "pow", "power"], op: Math.pow },
		log: { args: 2, names: ["log", "logarithm"], op: (val1, val2) => { return Math.log(val1) / Math.log(val2); } },
		or: { args: 2, names: ["||", "or"], op: (val1, val2) => { return val1 || val2; } },
		bitor: { args: 2, names: ["|", "bitor", "bitwiseor"], op: (val1, val2) => { return val1 | val2; } },
		and: { args: 2, names: ["&&", "and"], op: (val1, val2) => { return val1 && val2; } },
		bitand: { args: 2, names: ["&", "bitand", "bitwiseand"], op: (val1, val2) => { return val1 & val2; } },
		mod: { args: 2, names: ["%", "mod", "fmod"], op: (val1, val2) => { return val1 % val2; } },

		abs: { args: 1, names: ["abs", "fabs"], op: Math.abs },
		not: { args: 1, names: ["~", "not"], op: (val) => { return !val; } },
		floor: { args: 1, names: ["floor"], op: Math.floor },
		ceil: { args: 1, names: ["ceil", "ceiling"], op: Math.ceil },
		fract: { args: 1, names: ["fract", "fraction", "fractpart", "fractionpart"], op: (val) => { return Math.ceil(val) - val; } },
		sin: { args: 1, names: ["sin", "sine"], op: Math.sin },
		cos: { args: 1, names: ["cos", "cosine"], op: Math.cos },
		tan: { args: 1, names: ["tg", "tan", "tangent"], op: Math.tan },
		cotan: { args: 1, names: ["cotg", "cotan", "cot", "cotangent"], op: (val) => { return 1.0 / Math.tan(val); } },

		nop: { args: 1, names: ["nop", "noop", "pass", "id", "identity", "to"], op: (val) => { return val; } },
	},
	converters: {
		"metric heat": { "imperial heat": (val, from, to) => {return (val * 1.8) + 32; } },
		"imperial heat": { "metric heat": (val, from, to) => {return (val - 32) / 1.8; } },
	},
	chunkTypes: {
		number: 0,
		operator: 1,
		openingBracket: 2,
		closingBracket: 3,
	},
	getConverter(oldunit, newunit) {
		if (!oldunit.subtype || !newunit.subtype) return false;

		if (oldunit.subtype == newunit.subtype) return false;

		if (module.exports.converters[oldunit.subtype] && module.exports.converters[oldunit.subtype][newunit.subtype]) {
			return module.exports.converters[oldunit.subtype][newunit.subtype];
		}

		return false;
	},
	find(arr, thing) {
		if (!arr) return -1;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] == thing) return i;
		}
		return -1;
	},
	remove(arr, thing) {
		const arr2 = [];
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] != thing) arr2.push(arr[i]);
		}
		return arr2;
	},
	isDigit(char) {
		return char >= "0" && char <= "9";
	},
	isNumeric(char) {
		return module.exports.isDigit(char) || char == "-" || char == ".";
	},
	convertUnit(val, newunit) {
		if (!val.chunkType == module.exports.chunkTypes.number) throw Error(`Trying to convert not-number ${val} to units ${newunit}`);

		if (val.unit == newunit) return val;

		if (val.unit.type != newunit.type) {
			val.unit = newunit;
			return val;
		}

		if (val.unit.type == newunit.type) {
			const converter = module.exports.getConverter(val.unit, newunit);
			if (!converter) {
				val.value *= val.unit.value / newunit.value;
				val.unit = newunit;
				return val;
			} else {
				val.value = converter(val.value, val.unit, newunit);
				val.unit = newunit;
				return val;
			}
		}
	},
	// TODO: do this better?
	makeOp1Arg(op) {
		return (val) => {
			val.value = op(val.value);
			return val;
		};
	},
	makeOp2Arg(op) {
		return (val1, val2) => {
			if (val1.unit != val2.unit) {
				if (val1.unit != module.exports.units.untyped) {
					val2 = module.exports.convertUnit(val2, val1.unit);
				} else {
					val1 = module.exports.convertUnit(val1, val2.unit);
				}
			}
			val1.value = op(val1.value, val2.value);
			return val1;
		};
	},
	translateChunk(chunk) {
		const numRegex = /^-?(?:(?:\d*\.\d*)|\d+)$/.exec(chunk);
		if (numRegex) {
			return { chunkType: module.exports.chunkTypes.number, value: parseFloat(chunk), unit: module.exports.units.untyped };
		} else {
			for (let u in module.exports.units) {
				u = module.exports.units[u];
				if (module.exports.find(u.names, chunk) > -1) {
					return { chunkType: module.exports.chunkTypes.operator, args: 1, op: (val) => { return module.exports.convertUnit(val, u); }, righty: true };
				}
			}
			for (let o in module.exports.operators) {
				o = module.exports.operators[o];
				if (module.exports.find(o.names, chunk) > -1) {
					// TODO: see line 120
					if (o.args == 1) return { chunkType: module.exports.chunkTypes.operator, args: o.args, op: module.exports.makeOp1Arg(o.op) };
					else return { chunkType: module.exports.chunkTypes.operator, args: o.args, op: module.exports.makeOp2Arg(o.op) };
				}
			}
			if (chunk == "(") return { chunkType: module.exports.chunkTypes.openingBracket };
			if (chunk == ")") return { chunkType: module.exports.chunkTypes.closingBracket };
			try {
				const { currencies } = require("./currencies.json");
				const { currencySynonyms } = require("./currencySynonyms.json");
				for (const cur in currencies) {
					if (chunk.toUpperCase() == cur || (module.exports.find(currencySynonyms[cur], chunk) > -1)) {
						let _names = [cur];
						if (currencySynonyms[cur]) _names = _names.concat(currencySynonyms[cur]);
						return { chunkType: module.exports.chunkTypes.operator, args: 1, op: (val) => {
							return module.exports.convertUnit(val, { value: 1.0 / currencies[cur], type: "currency", names: _names });
						}, righty: true };
					}
				}
			} catch (error) {
				console.log("Likely couldn't access currencies.\n", error);
			}
		}
		throw Error(`Unrecognized chunk [${chunk}]`);
	},
	stringifyChunk(chunk) {
		if (chunk.chunkType == module.exports.chunkTypes.openingBracket) return "(";
		if (chunk.chunkType == module.exports.chunkTypes.closingBracket) return ")";
		if (chunk.chunkType == module.exports.chunkTypes.operator) return "op";
		if (chunk.chunkType == module.exports.chunkTypes.number) return `${chunk.value}${chunk.unit == module.exports.units.untyped ? "" : ` ${chunk.unit.names.at(-1)}`}`;
	},
	convertInfix(translated) {
		let ignoredOpenBrackets = 0, ignoredClosingBrackets = 0;
		const conversionStack = [];
		const polish = [];
		const chunkTypes = module.exports.chunkTypes;
		for (const c of translated) {
			if (c.chunkType == chunkTypes.number) {
				polish.push(c);
				continue;
			}

			if (c.chunkType == chunkTypes.operator && ((conversionStack.length == 0) || (conversionStack.at(-1).chunkType == chunkTypes.openingBracket))) {
				conversionStack.push(c);
				continue;
			}

			if (c.chunkType == chunkTypes.openingBracket) {
				conversionStack.push(c);
				continue;
			}

			if (c.chunkType == chunkTypes.closingBracket) {
				while ((conversionStack.length > 0) && (conversionStack.at(-1).chunkType != chunkTypes.openingBracket)) {
					polish.push(conversionStack.pop());
				}
				if (conversionStack.length == 0) ignoredClosingBrackets++;
				else conversionStack.pop();
				continue;
			}


			let tempPriorityChunk = 0;
			if (c.priority) tempPriorityChunk = c.priority;
			let tempPriorityStack = 0;
			if (conversionStack.at(-1).priority) tempPriorityStack = conversionStack.at(-1).priority;

			while ((conversionStack.length > 0) && (tempPriorityChunk < tempPriorityStack)) {
				polish.push(conversionStack.pop());
				if (conversionStack.length > 0) {
					if (conversionStack.at(-1).priority) tempPriorityStack = conversionStack.at(-1).priority;
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

		while (conversionStack.length > 0) {
			const stk = conversionStack.pop();
			if (stk.chunkType == chunkTypes.openingBracket) {
				ignoredOpenBrackets++;
			} else {
				polish.push(stk);
			}
		}

		return [polish, ignoredOpenBrackets, ignoredClosingBrackets];
	},
};