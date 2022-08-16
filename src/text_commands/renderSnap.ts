import { renderSnap, SnapParams } from "../extras/render_stuff";
import { getLinkFromText } from "../extras/text_recognition";
import { clamp, pickRandom } from "../extras/math_stuff";
import { TextCommandResult } from "./_text_command_utils";

async function execute(message: any, regexResults: RegExpExecArray, extraRegex: (RegExpExecArray|null)[]) {
	const renderParams: SnapParams = {};
	let bonusText = "Snapping that";
	let hasWith = false;

	const link = await getLinkFromText(regexResults[2], message);

	if (extraRegex[0]) {
		let angle = parseFloat(extraRegex[0][1]);
		if (!regexResults[0][2]) angle = angle * (Math.PI / 180);
		bonusText += ` rotated ${angle} radians`;
		renderParams.angle = angle;
	}
	// !! No, object is NOT possibly null, that's what the FIRST statement in the if is for!                    \/
	if (extraRegex[1] && ["Circle", "Hexagon", "Octagon", "One", "Triangle", "Tile"].find((str) => {return (extraRegex[1] as RegExpExecArray)[1] == str;})) {
		const shape = extraRegex[1][1].toString();
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

	const renderResult: TextCommandResult = await renderSnap(link, renderParams, message, { content: bonusText });
	renderResult.text = pickRandom(["Bye bye.", "It's no more.", "There it goes...", "Watch it vanish."]);

	return renderResult;
}

export { execute };