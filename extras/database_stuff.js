const Sequelize = require("sequelize");
const { findDict } = require("./math_stuff.js");

module.exports = {
	currentStorage: "database.sqlite",
	newStorage: "newdatabase.sqlite",
	currentCols: {
		userID: { type: Sequelize.STRING, unique: true, allowNull: false },
		reputation: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
		upperOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		lowerOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		digitOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		ignore: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
		reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		reactChance: { type: Sequelize.FLOAT, defaultValue: 1.0, allowNull: false },
		addendum: Sequelize.TEXT,
	},
	newCols: {
		userID: { type: Sequelize.STRING, unique: true, allowNull: false },
		reputation: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
		rank: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		upperOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		lowerOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		digitOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		otherOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		ignore: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
		reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		reactChance: { type: Sequelize.FLOAT, defaultValue: 1.0, allowNull: false },
		errorType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
		parseType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	},
	async migrateAny(oldTable, oldCols, newCols) {
		const newdbconnection = new Sequelize("database", "user", "password", {
			host: "localhost",
			dialect: "sqlite",
			logging: false,
			storage: module.exports.newStorage,
		});
		const ignoreCols = newCols;
		for (const col in ignoreCols) {
			if (findDict(oldCols, col) != -1) ignoreCols[col] = { doType: 1 };
			else ignoreCols[col] = { doType: 0, val: ignoreCols[col].defaultValue };
		}
		const newdb = newdbconnection.define("db", newCols);
		let i = 0;
		for (const row of oldTable) {
			const newRow = ignoreCols;
			for (const col in newRow) {
				if (newRow[col].doType == 1) {
					newRow[col] = row[col];
				} else {
					newRow[col] = newRow[col].defaultValue;
				}
			}
			newdb.create(newRow);
			i++;
		}
		return { count: i, sample: await newdb.findAll({ where: { id: { [lt]: 3 } } }) };
	},
	async migrate(db) {
		return module.exports.migrateAny(await db.findAll(), module.exports.currentCols, module.exports.newCols);
	},
};