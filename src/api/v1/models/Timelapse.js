const { DataTypes } = require('sequelize');
const sequelize = require('src/db');

const Timelapse = sequelize.define('Timelapse', {
    fileName: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = Timelapse;