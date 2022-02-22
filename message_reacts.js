// TODO: Use list of Guild and emote IDs
const oneReactID = "944199066911395840";
module.exports = {
	reactTypes: [
		// The name should start with something that you could sensibly add "I will " to, and not end with punctuation.
		{ name: "react when you mention \"One\", \"one\" or \"1\"",
			testReact(message, row, oneCount) {
				return oneCount[0];
			},
		},
		{ name: "only react when you mention \"One\"",
			testReact(message, row, oneCount) {
				return oneCount[1];
			},
		},
		{ name: "only react when you mention \"one\"",
			testReact(message, row, oneCount) {
				return oneCount[2];
			},
		},
		{ name: "only react when you mention \"1\"",
			testReact(message, row, oneCount) {
				return oneCount[3];
			},
		},
		{ name: "react every 10 mentions of \"One\" or \"one\" you make",
			async testReact(message, row, oneCount) {
				const oldtotal = row.lowerOne + row.upperOne;
				return (Math.floor((oldtotal + oneCount[0] - oneCount[4]) / 10) - Math.floor(oldtotal / 10)) > 0;
			},
		},
		{ name: "react every 10 mentions of \"One\", \"one\" or \"1\" you make",
			async testReact(message, row, oneCount) {
				const oldtotal = row.lowerOne + row.upperOne + row.digitOne;
				return (Math.floor((oldtotal + oneCount[0]) / 10) - Math.floor(oldtotal / 10)) > 0;
			},
		},
	],
	reactChoose(message, row, oneCount) {
		if (row.reactType < 0 || row.reactType >= module.exports.reactTypes.length) return [];

		const res = module.exports.reactTypes[row.reactType].testReact(message, row, oneCount);

		if (res && (Math.random() <= row.reactChance)) return [oneReactID];

		return [];
	},
	unknownReact: "Unknown reaction type",
};