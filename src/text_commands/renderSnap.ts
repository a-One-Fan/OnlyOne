const { renderSnap } = require("../extras/render_stuff.js");
const { getLinkFromText } = require("../extras/text_recognition.js");
const { clamp, pickRandom } = require("../extras/math_stuff.js");

module.exports = {
	async execute(message: any, regexResults: string[], extraRegex: string[][]) {
		const renderParams = {};
		let bonusText = "Snapping that";
		let hasWith = false;

		const link = await getLinkFromText(regexResults[2], message);

		if (extraRegex[0]) {
			let angle = parseFloat(extraRegex[0][1]);
			if (!regexResults[0][2]) angle = angle * (Math.PI / 180);
			bonusText += ` rotated ${angle} radians`;
			renderParams.angle = angle;
		}

		if (extraRegex[1] && ["Circle", "Hexagon", "Octagon", "One", "Triangle", "Tile"].find((str) => {return extraRegex[1][1] == str;})) {
			const shape = extraRegex[1][1];
			bonusText += `, with ${shape}-shaped particles`;
			hasWith = true;
			renderParams.shape = shape;
		}

		if (extraRegex[2]) {
			let distance = parseFloat(extraRegex[2][1]);
			distance = clamp(1, 25, distance);
			bonusText += `${hasWith ? " and " : ", with "}minimum particle distance ${distance}`;
			hasWith = true;
			distance = distance * 0.01;
			renderParams.distance = distance;
		}

		if (extraRegex[3]) {
			let size = parseFloat(extraRegex[3][1]);
			size = clamp(0.1, 20, size);
			bonusText += `${hasWith ? " and " : ", with "}particle size ${size}`;
			hasWith = true;
			renderParams.size = size;
		}

		if (extraRegex[4]) {
			const color = extraRegex[4][1];
			bonusText += `${hasWith ? " and " : ", with "}the background colored #${color}`;
			hasWith = true;
			renderParams.color = color;
		}

		bonusText += "...";

		const renderResult = await renderSnap(link, renderParams, message, bonusText);
		renderResult.text = pickRandom(["Bye bye.", "It's no more.", "There it goes...", "Watch it vanish."]);

		return renderResult;
	},
};