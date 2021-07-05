const { DataTypes } = require('sequelize');
const sequelize = require('src/db');

const Image = sequelize.define('Image', {
    fileName: {
        type: DataTypes.STRING(128),
        allowNull: false
        
    },
    owner: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING(16),
        allowNull: false
    }
});

module.exports = Image;