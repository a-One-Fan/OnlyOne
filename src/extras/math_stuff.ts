import { CachedJson } from "./file_stuff";
import { CURRENCIES_PATH } from "./currency";
import { currencySynonyms } from "./currencySynonyms.json";

const retypedSynonyms = currencySynonyms as unknown as {[val: string]: string[]};

const chunkTypes = {
	number: 0,
	operator: 1,
	openingBracket: 2,
	closingBracket: 3,
}

type chunkOp = ((a: MathExpressionChunk) => MathExpressionChunk) | ((a: MathExpressionChunk, b: MathExpressionChunk) => MathExpressionChunk)

interface IMathExpressionChunk {
	chunkType: number;
	priorty?: number;
	value?: number;
	args?: number;
	righty?: boolean;
	op?: chunkOp;
}

// TODO: Split into 3 classes?
export class MathExpressionChunk {
	chunkType!: number;
	priority?: number;
	value?: number;
	args?: number;
	righty?: boolean;
	unit?: Unit;
	op?: chunkOp;
	constructor(obj: IMathExpressionChunk) {
		Object.assign(this, obj)
	}
}

interface IUnit {
	value: number;
	type: string;
	subtype?: string;
	names: string[];
}

class Unit {
	value!: number;
	type!: string;
	subtype?: string;
	names!: string[];

	constructor(obj_or_val: number | IUnit, type?: string, subtype?: string, names?: string[]) {
		if (typeof obj_or_val === "number") {
			this.value = obj_or_val;
			this.type = type as string;
			this.subtype = subtype as string;
			this.names = names as string[];
		}else{
			Object.assign(this, obj_or_val)
		}
	}
}

type opType = ((a: number) => number) | ((a: number, b: number) => number)

interface IOperator {
	args: number;
	names: string[];
	op: opType;
}

class Operator {
	args!: number;
	names!: string[];
	op!: opType;

	constructor(obj_or_val: number | IOperator, names?: string[], op?: opType) {
		if (typeof obj_or_val === "number") {
			this.args = obj_or_val;
			this.names = names as string[];
			this.op = op as opType;
		}else{
			Object.assign(this, obj_or_val)
		}
	}
}

// Make resolution even so that h264 can properly encode.
function evenify(resolution: [number, number]): [number, number] {
	resolution = [Math.floor(resolution[0]), Math.floor(resolution[1])];
	return [resolution[0] + resolution[0] % 2, resolution[1] + resolution[1] % 2];
}

function clamp(min: number, max: number, val: number) {
	if (val < min) return min;
	if (val > max) return max;
	return val;
}

function pickRandom(arr: any[]) {
	return arr[Math.floor(Math.random() * arr.length)];
}
// test(i) - a function that returns true/false based on the index, suitable for logarithmic searching (i.e. no true after false)
function binarySearchF(test: (i: number) => boolean, len: number): number {
	let lo: number, hi: number;
	lo = 0;
	hi = len;
	while (lo < hi) {
		const mid = lo + Math.floor((lo - hi) / 2.0);
		if (test(lo)) {
			lo = mid + 1;
		} else {
			hi = mid;
		}
	}
	return lo;
}
function binarySearch(arr: any[], val: number) {
	return binarySearchF((i: number) => {return arr[i] < val;}, arr.length);
}
function pickRandomWeighted(arr: [any, number][]) {
	const summedWeights: number[] = [];
	let sum = 0;
	for (let i = 0; i < arr.length; i++) {
		sum = sum + arr[i][1];
		summedWeights.push(sum);
	}
	const rand = Math.random() * sum;
	const resIndex = binarySearchF((i: number) => {return summedWeights[i] < rand;}, arr.length);
	return arr[resIndex][0];
}
// Mismatched types will override one another.
// Mismatched subtypes will attempt to use a special conversion function.
// If none present, will fallback to value conversion.
// Subtype-less units will match all other subtypes
// Matching subtypes will get converted linearly via their value, if present
const units = [
	new Unit({ value: 0, type: "untyped", names: ["un", "untype", "typeless", "untyped"] }),

	new Unit({ value: 0.001, type: "weight", subtype: "metric weight", names: ["g", "gram", "grams"] }),
	new Unit({ value: 1, type: "weight", subtype: "metric weight", names: ["kg", "kilogram", "kilograms", "kilos"] }),
	new Unit({ value: 1000, type: "weight", subtype: "metric weight", names: ["t", "ton", "tons"] }),
	new Unit({ value: 0.4535924, type: "weight", subtype: "imperial weight", names: ["lb", "pounds"] }),

	new Unit({ value: 0.001, type: "distance", subtype: "metric distance", names: ["mm", "milimetre", "mmilimeter", "milimeters", "milimetres"] }),
	new Unit({ value: 0.01, type: "distance", subtype: "metric distance", names: ["cm", "centimetre", "centimeter", "centimeters", "centimetres"] }),
	new Unit({ value: 0.1, type: "distance", subtype: "metric distance", names: ["dm", "decimetre", "decimeter", "decimeters", "decimetres"] }),
	new Unit({ value: 1, type: "distance", subtype: "metric distance", names: ["m", "metre", "meter", "meters", "metres"] }),
	new Unit({ value: 1000, type: "distance", subtype: "metric distance", names: ["km", "kilometer", "kilometre", "kilometers", "kilometres"] }),
	new Unit({ value: 0.0254, type: "distance", subtype: "imperial distance", names: ["in", "inch", "inches"] }),
	new Unit({ value: 0.3048, type: "distance", subtype: "imperial distance", names: ["ft", "foot", "feet", "footfetish"] }),
	new Unit({ value: 0.9144, type: "distance", subtype: "imperial distance", names: ["yd", "yard", "yards"]}),
	new Unit({ value: 1609.344, type: "distance", subtype: "imperial distance", names: ["mil", "mile", "miles"] }),

	new Unit({ value: 0, type: "heat", subtype: "metric heat", names: ["c", "celsius", "centigrade"] }),
	new Unit({ value: 0, type: "heat", subtype: "imperial heat", names: ["f", "farenheit"] }),

	new Unit({ value: 0.001, type: "liquid", subtype: "metric liquid", names: ["ml", "mililiter", "mililitre", "mililiters", "mililitres"] }),
	new Unit({ value: 1.0, type: "liquid", subtype: "metric liquid", names: ["l", "litre", "liter", "liters", "litres"] }),
	new Unit({ value: 0.2199692, type: "liquid", subtype: "imperial liquid", names: ["gl", "gallon", "gallons"] }),

	new Unit({ value: 0.001, type: "time", names: ["ms", "millisecond", "milliseconds"] }),
	new Unit({ value: 1, type: "time", names: ["s", "second", "seconds"] }),
	new Unit({ value: 60, type: "time", names: ["min", "minute", "minutes"] }),
	new Unit({ value: 3600, type: "time", names: ["h", "hr", "hour", "hours"] }),
	new Unit({ value: 60 * 60 * 24, type: "time", names: ["d", "day", "days"] }),
	new Unit({ value: 30.4375 * 60 * 60 * 24, type: "time", names: ["mo", "month", "months"] }),
	new Unit({ value: 365.25 * 60 * 60 * 24, type: "time", names: ["y", "year", "years"] }),
	new Unit({ value: 10 * 365.25 * 60 * 60 * 24, type: "time", names: ["dec", "decade", "decades"] }),
	new Unit({ value: 100 * 365.25 * 60 * 60 * 24, type: "time", names: ["century", "centuries"] }),

	new Unit({ value: 1, type: "angle", names: ["r", "rad", "rads", "radians"] }),
	new Unit({ value: 180 / Math.PI, type: "angle", names: ["d", "deg", "degrees"] }),

	new Unit({ value: 1.0 / 8.0, type: "bits", names: ["b", "bit", "bits"] }),
	new Unit({ value: 1, type: "bits", names: ["B", "byte", "bytes"] }),

	new Unit({ value: 1000, type: "bits", names: ["KB", "kB", "kilobyte", "kilobytes"] }),
	new Unit({ value: 125, type: "bits", names: ["Kb", "kb", "kbit", "kilobit", "kilobits"] }),
	new Unit({ value: 1024, type: "bits", names: ["KiB", "kiB", "kibibyte", "kibibytes"] }),
	new Unit({ value: 128, type: "bits", names: ["Kib", "kib", "kibit", "kibibit", "kibibits"] }),

	new Unit({ value: 1000000, type: "bits", names: ["MB", "mB", "megabyte", "megabytes"] }),
	new Unit({ value: 125000, type: "bits", names: ["Mb", "mb", "mbit", "megabit", "megabits"] }),
	new Unit({ value: 1048576, type: "bits", names: ["MeB", "meB", "mebibyte", "mebibytes"] }),
	new Unit({ value: 131072, type: "bits", names: ["Meb", "meb", "mebit", "mebibit", "mebibits"] }),

	new Unit({ value: 1000000000, type: "bits", names: ["GB", "gB", "gigabyte", "gigabytes"] }),
	new Unit({ value: 125000000, type: "bits", names: ["Gb", "gb", "gbit", "gigabit", "gigabits"] }),
	new Unit({ value: 8589934592, type: "bits", names: ["GiB", "giB", "gibibyte", "gibibytes"] }),
	new Unit({ value: 134217728, type: "bits", names: ["Gib", "gib", "gibit", "gibibit", "gibibits"] }),

	new Unit({ value: 1000000000000, type: "bits", names: ["TB", "tB", "terabyte", "terabytes"] }),
	new Unit({ value: 125000000000, type: "bits", names: ["Tb", "tb", "tbit", "terabit", "terabits"] }),
	new Unit({ value: 1099511627776, type: "bits", names: ["TeB", "teB", "tebibyte", "tebibytes"] }),
	new Unit({ value: 137438953472, type: "bits", names: ["Teb", "teb", "tebit", "tebibit", "tebibits"] }),

	new Unit({ value: 0, type: "timezone", names: ["utc", "UTC", "gmt", "GMT", "Coordinated Universal Time"] }),
	new Unit({ value: -8, type: "timezone", names: ["pst", "PST", "Pacific Standard Time"] }),
	new Unit({ value: -10, type: "timezone", names: ["jst", "JST", "Japan Standard Time"] }),
	new Unit({ value: -5, type: "timezone", names: ["est", "EST", "Eastern Standard Time"] }),
]

const UNTYPED_UNIT = 0

// TODO: how tf do you refer to default functions like + as a function? To assign to a variable?
// TODO: trig functions
const operators = [
	new Operator({ args: 2, names: ["+", "plus"], op: (val1: number, val2: number) => { return val1 + val2; } }),
	new Operator({ args: 2, names: ["-", "minus"], op: (val1: number, val2: number) => { return val1 - val2; } }),
	new Operator({ args: 2, names: ["*", "times"], op: (val1: number, val2: number) => { return val1 * val2; } }),
	new Operator({ args: 2, names: ["/", "divide", "divided", "divideby", "dividedby"], op: (val1: number, val2: number) => { return val1 / val2; } }),
	new Operator({ args: 2, names: ["^", "**", "pow", "power"], op: Math.pow }),
	new Operator({ args: 2, names: ["log", "logarithm"], op: (val1: number, val2: number) => { return Math.log(val1) / Math.log(val2); } }),
	new Operator({ args: 2, names: ["||", "or"], op: (val1: number, val2: number) => { return val1 || val2; } }),
	new Operator({ args: 2, names: ["|", "bitor", "bitwiseor"], op: (val1: number, val2: number) => { return val1 | val2; } }),
	new Operator({ args: 2, names: ["&&", "and"], op: (val1: number, val2: number) => { return val1 && val2; } }),
	new Operator({ args: 2, names: ["&", "bitand", "bitwiseand"], op: (val1: number, val2: number) => { return val1 & val2; } }),
	new Operator({ args: 2, names: ["%", "mod", "fmod"], op: (val1: number, val2: number) => { return val1 % val2; } }),

	new Operator({ args: 1, names: ["abs", "fabs"], op: Math.abs }),
	new Operator({ args: 1, names: ["~", "not"], op: (val: number) => { return (!val) as unknown as number; } }),
	new Operator({ args: 1, names: ["floor"], op: Math.floor }),
	new Operator({ args: 1, names: ["ceil", "ceiling"], op: Math.ceil }),
	new Operator({ args: 1, names: ["round"], op: Math.round }),
	new Operator({ args: 1, names: ["fract", "fraction", "fractpart", "fractionpart"], op: (val: number) => { return Math.ceil(val) - val; } }),
	new Operator({ args: 1, names: ["sin", "sine"], op: Math.sin }),
	new Operator({ args: 1, names: ["cos", "cosine"], op: Math.cos }),
	new Operator({ args: 1, names: ["tg", "tan", "tangent"], op: Math.tan }),
	new Operator({ args: 1, names: ["cotg", "cotan", "cot", "cotangent"], op: (val: number) => { return 1.0 / Math.tan(val); } }),

	new Operator({ args: 1, names: ["nop", "noop", "pass", "id", "identity", "to"], op: (val: number) => { return val; } }),
]
interface coverter_sub {
	[to: string]: ((val: number, from: Unit, to: Unit) => number)
}
interface converterList {
	[from: string]: coverter_sub
}
const converters: converterList = {
	"metric heat": { "imperial heat": (val: number, from: Unit, to: Unit) => {return (val * 1.8) + 32; } },
	"imperial heat": { "metric heat": (val: number, from: Unit, to: Unit) => {return (val - 32) / 1.8; } },
}
function getConverter(oldunit: Unit, newunit: Unit) {
	if (!oldunit.subtype || !newunit.subtype) return false;

	if (oldunit.subtype == newunit.subtype) return false;

	if (converters[oldunit.subtype] && converters[oldunit.subtype][newunit.subtype]) {
		return converters[oldunit.subtype][newunit.subtype];
	}

	return false;
}
// TODO: some way to specify arr is thing's type but array?
// Returns -1 if no find, 0 counts as a found result!
function find(arr: any[], thing: any) {
	if (!arr) return -1;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] == thing) return i;
	}
	return -1;
}
// Returns -1 if no find, 0 counts as a found result!
function findDict(dict: [index: string], thing: any) {
	if (!dict) return -1;
	let i = 0;
	for (const item in dict) {
		if (item == thing) return i;
		i++;
	}
	return -1;
}

function remove(arr: any[], thing: any) {
	const arr2 = [];
	for (let i = 0; i < arr.length; i++) {
		if (arr[i] != thing) arr2.push(arr[i]);
	}
	return arr2;
}

function isDigit(char: string) {
	return char >= "0" && char <= "9";
}
function isNumeric(char: string) {
	return isDigit(char) || char == "-" || char == ".";
}
function convertUnit(val: MathExpressionChunk, newunit: Unit) {
	if (!(val.chunkType == chunkTypes.number) || !val.unit || !val.value) throw Error(`Trying to convert not-number ${val} to units ${newunit}`);

	if (val.unit == newunit) return val;

	if (val.unit.type != newunit.type) {
		val.unit = newunit;
		return val;
	}


	//if (val.unit.type == newunit.type) {
	const converter = getConverter(val.unit, newunit);
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
// TODO: do this better?
function makeOp1Arg(op: opType) {
	return (val: MathExpressionChunk) => {
		// !!    Why does it expect a 2nd parameter here???
		val.value = (op as any)(val.value);
		return val;
	};
}
function makeOp2Arg(op: opType) {
	return (val1: MathExpressionChunk, val2: MathExpressionChunk) => {
		if (val1.unit != val2.unit) {
			if (val1.unit != units[UNTYPED_UNIT]) {
				if (!val1.unit) throw Error("val1 is unitless!")
				val2 = convertUnit(val2, val1.unit);
			} else {
				if (!val2.unit) throw Error("val2 is unitless!")
				val1 = convertUnit(val1, val2.unit);
			}
		}
		if (typeof val1.value === "undefined" || typeof val2.value === "undefined") throw Error("val1 or val2 have no value defined!");
		val1.value = op(val1.value, val2.value);
		return val1;
	};
}

const currenciesCache = new CachedJson(CURRENCIES_PATH);
function translateChunk(chunk: string): MathExpressionChunk {
	const numRegex = /^-?(?:(?:\d*\.\d*)|\d+)$/.exec(chunk);
	if (numRegex) {
		return { chunkType: chunkTypes.number, value: parseFloat(chunk), unit: units[UNTYPED_UNIT] };
	} else {
		let u: Unit
		for (u of units) {
			if (find(u.names, chunk) > -1) {
				return { chunkType: chunkTypes.operator, args: 1, op: (val: MathExpressionChunk) => { return convertUnit(val, u); }, righty: true };
			}
		}
		let o: Operator
		for (o of operators) {
			if (find(o.names, chunk) > -1) {
				// TODO: see line 120
				if (o.args == 1) return { chunkType: chunkTypes.operator, args: o.args, op: makeOp1Arg(o.op) };
				else return { chunkType: chunkTypes.operator, args: o.args, op: makeOp2Arg(o.op) };
			}
		}
		if (chunk == "(") return { chunkType: chunkTypes.openingBracket };
		if (chunk == ")") return { chunkType: chunkTypes.closingBracket };
		try {
			currenciesCache.reload();
			const { currencies } = currenciesCache.JSON;
			for (const cur in currencies) {
				// !! 3 bugs found, 20+ times I've had to tell typescript off because it fails at basic things!
				if (chunk.toUpperCase() == cur || (find(retypedSynonyms[cur], chunk) > -1)) {
					let _names = [cur];
					if (retypedSynonyms[cur]) _names = _names.concat(retypedSynonyms[cur]);
					return { chunkType: chunkTypes.operator, args: 1, op: (val: MathExpressionChunk) => {
						return convertUnit(val, { value: 1.0 / currencies[cur], type: "currency", names: _names });
					}, righty: true };
				}
			}
		} catch (error) {
			console.log("Likely couldn't access currencies.\n", error);
		}
	}
	throw Error(`Unrecognized chunk [${chunk}]`);
}
function stringifyChunk(chunk: MathExpressionChunk) {
	if (chunk.chunkType == chunkTypes.openingBracket) return "(";
	if (chunk.chunkType == chunkTypes.closingBracket) return ")";
	if (chunk.chunkType == chunkTypes.operator) return "op";

	if (typeof chunk.unit === "undefined") throw Error("Unitless chunk!")
	if (chunk.chunkType != chunkTypes.number) throw Error("Unknown chunk type!")
		return `${chunk.value}${chunk.unit == units[UNTYPED_UNIT] ? "" : ` ${chunk.unit.names.at(-1)}`}`;
}
function convertInfix(translated: MathExpressionChunk[]): [MathExpressionChunk[], number, number] {
	let ignoredOpenBrackets = 0, ignoredClosingBrackets = 0;
	const conversionStack: MathExpressionChunk[] = [];
	const polish: MathExpressionChunk[] = [];
	for (const c of translated) {
		if (c.chunkType == chunkTypes.number) {
			polish.push(c);
			continue;
		}

		// !! Typescript fail  AGAIN
		if (c.chunkType == chunkTypes.operator && ((conversionStack.length == 0) || 
		((conversionStack.at(-1) as MathExpressionChunk).chunkType == chunkTypes.openingBracket))) {
			conversionStack.push(c);
			continue;
		}

		if (c.chunkType == chunkTypes.openingBracket) {
			conversionStack.push(c);
			continue;
		}

		if (c.chunkType == chunkTypes.closingBracket) {
			// !! Typescript fail                                         \/
			while ((conversionStack.length > 0) && ((conversionStack.at(-1) as MathExpressionChunk).chunkType != chunkTypes.openingBracket)) {
				// !! Typescript fail        \/
				polish.push(conversionStack.pop() as MathExpressionChunk);
			}
			if (conversionStack.length == 0) ignoredClosingBrackets++;
			else conversionStack.pop();
			continue;
		}


		let tempPriorityChunk = 0;
		if (c.priority) tempPriorityChunk = c.priority;
		let tempPriorityStack = 0;
		// !! More TS fail...
		if ((conversionStack.at(-1) as MathExpressionChunk).priority) tempPriorityStack = (conversionStack.at(-1) as MathExpressionChunk).priority as number;

		while ((conversionStack.length > 0) && (tempPriorityChunk < tempPriorityStack)) {
			polish.push(conversionStack.pop() as MathExpressionChunk);
			if (conversionStack.length > 0) {
				// !! Typescript fail  \/
				if ((conversionStack.at(-1) as MathExpressionChunk).priority) tempPriorityStack = (conversionStack.at(-1) as MathExpressionChunk).priority as number;
				else tempPriorityStack = 0;
			}
		}

		if (conversionStack.length == 0 || tempPriorityChunk > tempPriorityStack) {
			conversionStack.push(c);
			continue;
		}

		if (c.righty) {
			const top = conversionStack.pop();
			if (typeof top === "undefined") throw Error("Undefined math stack top!")
			polish.push(top);
		}

		conversionStack.push(c);

	}

	while (conversionStack.length > 0) {
		const top = conversionStack.pop();
		if (typeof top === "undefined") throw Error("Undefined math stack top!")
		if (top.chunkType == chunkTypes.openingBracket) {
			ignoredOpenBrackets++;
		} else {
			polish.push(top);
		}
	}

	return [polish, ignoredOpenBrackets, ignoredClosingBrackets];
}

export { evenify, clamp, pickRandom, binarySearchF, binarySearch, pickRandomWeighted, units, operators, converters, chunkTypes, getConverter,
	find, findDict, remove, isDigit, isNumeric, convertUnit, makeOp1Arg, makeOp2Arg, translateChunk, stringifyChunk, convertInfix}