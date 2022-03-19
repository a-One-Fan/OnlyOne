const Sequelize = require("sequelize");
const { findDict, find } = require("./math_stuff.js");

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
        otherOne: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false},
        ignore: { type: Sequelize.BOOLEAN, defaultValue: false, allowNull: false },
        reactType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
        reactChance: { type: Sequelize.FLOAT, defaultValue: 1.0, allowNull: false },
        errorType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
        parseType: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
    },

}