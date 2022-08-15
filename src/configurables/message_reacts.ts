// TODO: Use list of Guild and emote IDs
const oneReactID = "944199066911395840";

const reactTypes = [
	// The name should start with something that you could sensibly add "I will " to, and not end with punctuation.
	{ name: "react when you mention \"One\", \"one\" or \"1\"",
		testReact(message: any, row: any, oneCount: number[]) {
			return oneCount[0];
		},
	},
	{ name: "only react when you mention \"One\"",
		testReact(message: any, row: any, oneCount: number[]) {
			return oneCount[1];
		},
	},
	{ name: "only react when you mention \"one\"",
		testReact(message: any, row: any, oneCount: number[]) {
			return oneCount[2];
		},
	},
	{ name: "only react when you mention \"1\"",
		testReact(message: any, row: any, oneCount: number[]) {
			return oneCount[3];
		},
	},
	{ name: "react every 10 mentions of \"One\" or \"one\" you make",
		async testReact(message: any, row: any, oneCount: number[]) {
			const oldtotal = row.lowerOne + row.upperOne;
			return (Math.floor((oldtotal + oneCount[0] - oneCount[4]) / 10) - Math.floor(oldtotal / 10)) > 0;
		},
	},
	{ name: "react every 10 mentions of \"One\", \"one\" or \"1\" you make",
		async testReact(message: any, row: any, oneCount: number[]) {
			const oldtotal = row.lowerOne + row.upperOne + row.digitOne;
			return (Math.floor((oldtotal + oneCount[0]) / 10) - Math.floor(oldtotal / 10)) > 0;
		},
	},
]
function reactChoose(message: any, row: any, oneCount: number[]) {
	if (row.reactType < 0 || row.reactType >= reactTypes.length) return [];

	const res = reactTypes[row.reactType].testReact(message, row, oneCount);
	let reactID = oneReactID;
	if (row.customReact) reactID = row.customReact;
	if (res && (Math.random() <= row.reactChance)) return [reactID];

	return [];
}
const unknownReact = "Unknown reaction type";
const listText = "I can react to you in the following ways";

export { reactTypes, reactChoose, unknownReact, listText };