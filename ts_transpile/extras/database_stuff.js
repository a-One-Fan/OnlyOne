"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
const { existsSync } = require("fs");
const { findDict } = require("./math_stuff.js");
const { lte } = Sequelize.Op;
module.exports = {
    currentStorage: "database.sqlite",
    newStorage: "newdatabase.sqlite",
    currentCols: {
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
    },
    newCols: {
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
    },
    migrateAny(oldTable, oldCols, newCols) {
        return __awaiter(this, void 0, void 0, function* () {
            if (existsSync(module.exports.newStorage)) {
                throw Error(`Database "${module.exports.newStorage}" exists!\n`);
            }
            const newdbconnection = new Sequelize("database", "user", "password", {
                host: "localhost",
                dialect: "sqlite",
                logging: false,
                storage: module.exports.newStorage,
            });
            const ignoreCols = {};
            Object.assign(ignoreCols, newCols);
            for (const col in ignoreCols) {
                if (findDict(oldCols, col) != -1)
                    ignoreCols[col] = { doType: 1 };
                else
                    ignoreCols[col] = { doType: 0, val: ignoreCols[col].defaultValue };
            }
            const newdb = newdbconnection.define("db", newCols);
            yield newdb.sync();
            console.log("newdb:", newdb);
            let i = 0;
            for (const row of oldTable) {
                const newRow = {};
                Object.assign(newRow, ignoreCols);
                for (const col in newRow) {
                    if (newRow[col].doType == 1) {
                        newRow[col] = row[col];
                    }
                    else {
                        newRow[col] = newRow[col].defaultValue;
                    }
                }
                newdb.create(newRow);
                i++;
            }
            return { count: i, sample: yield newdb.findAll({ where: { id: { [lte]: 3 } }, raw: true }) };
        });
    },
    migrate(db) {
        return __awaiter(this, void 0, void 0, function* () {
            return module.exports.migrateAny(yield db.findAll(), module.exports.currentCols, module.exports.newCols);
        });
    },
};
