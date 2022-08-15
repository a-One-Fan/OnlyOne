import Sequelize from "sequelize";
import { existsSync } from "fs";
import { findDict } from "./math_stuff";
const { lte } = Sequelize.Op;

const currentStorage = "database.sqlite"
const newStorage = "newdatabase.sqlite"
const currentCols = {
	userID: { type: Sequelize.STRING, unique: true, allowNull: false },
	reputation: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
	rank: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	upperOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	lowerOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	digitOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	otherOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	ignore: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
	reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	reactChance: { type: Sequelize.FLOAT, defaultValue: 1.0, allowNull: false },
	errorType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	parseType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	customReact: { type: Sequelize.STRING(32) },
}
const newCols = {
	userID: { type: Sequelize.STRING, unique: true, allowNull: false },
	reputation: { type: Sequelize.FLOAT, defaultValue: 0, allowNull: false },
	rank: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	upperOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	lowerOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	digitOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	otherOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	ignore: { type: Sequelize.BOOLEAN, defaultValue: true, allowNull: false },
	reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	reactChance: { type: Sequelize.FLOAT, defaultValue: 1.0, allowNull: false },
	errorType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	parseType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
	customReact: { type: Sequelize.STRING(32) },
}

async function migrateAny(oldTable: object[], oldCols: any, newCols: any) {

	if (existsSync(newStorage)) {
		throw Error(`Database "${newStorage}" exists!\n`);
	}

	const newdbconnection = new Sequelize.Sequelize("database", "user", "password", {
		host: "localhost",
		dialect: "sqlite",
		logging: false,
		storage: newStorage,
	});
	const ignoreCols: any = {};
	Object.assign(ignoreCols, newCols);
	for (const col in ignoreCols) {
		if (findDict(oldCols, col) != -1) ignoreCols[col] = { doType: 1 };
		else ignoreCols[col] = { doType: 0, val: ignoreCols[col].defaultValue };
	}
	const newdb = newdbconnection.define("db", newCols);
	await newdb.sync();
	console.log("newdb:", newdb);
	let i = 0;
	let row: any
	for (row of oldTable) {
		const newRow: any = {};
		Object.assign(newRow, ignoreCols);
		// TODO: bitch about typescript again - how is "for prop in obj" not implemented properly???
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

	return { count: i, sample: await newdb.findAll({ where: { id: { [lte]: 3 } }, raw: true }) };
}
// TODO: find db type
async function migrate(db: any) {
	return migrateAny(await db.findAll(), currentCols, newCols);
}

export { currentStorage, newStorage, currentCols, newCols, migrate };