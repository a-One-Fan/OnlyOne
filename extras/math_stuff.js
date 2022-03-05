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

		untype: { type: "untype", names: ["un", "untype", "typeless"] },
	},
	converters: {
		"metric heat": { "imperial heat": (val, from, to) => {return (val * 1.8) + 32; } },
		"imperial heat": { "metric heat": (val, from, to) => {return (val - 32) / 1.8; } },
	},
};