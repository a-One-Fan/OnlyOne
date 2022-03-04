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
}