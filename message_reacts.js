// TODO: Use list of Guild and emote IDs
const oneReactID = "944199066911395840";
module.exports = {
	reactTypes: [
		{ name: "React when mentioning \"One\", \"one\" or \"1\".",
			testReact(message, row, oneCount) {
				return oneCount[0];
			},
		},
		{ name: "Only react when mentioning \"One\".",
			testReact(message, row, oneCount) {
				return oneCount[1];
			},
		},
		{ name: "Only react when mentioning \"one\"",
			testReact(message, row, oneCount) {
				return oneCount[2];
			},
		},
		{ name: "Only react when mentioning \"1\"",
			testReact(message, row, oneCount) {
				return oneCount[3];
			},
		},
		{ name: "React every 10 mentions of \"One\" or \"one\".",
			async testReact(message, row, oneCount) {
				const oldtotal = row.lowerOne + row.upperOne;
				return (Math.floor((oldtotal + oneCount[0] - oneCount[4]) / 10) - Math.floor(oldtotal / 10)) > 0;
			},
		},
		{ name: "React every 10 mentions of \"One\", \"one\" or \"1\".",
			async testReact(message, row, oneCount) {
				const oldtotal = row.lowerOne + row.upperOne + row.digitOne;
				return (Math.floor((oldtotal + oneCount[0]) / 10) - Math.floor(oldtotal / 10)) > 0;
			},
		},
	],
	reactChoose(message, row, oneCount) {
		if (row.reactType < 0 || row.reactType >= module.exports.reactTypes.length) return [];

		const res = module.exports.reactTypes[row.reactType](message, row, oneCount);

		if (res && (Math.random() < row.reactChance)) return [oneReactID];

		return [];
	},
};