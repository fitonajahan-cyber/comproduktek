const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Gallery = sequelize.define('Gallery', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  image: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: false },
  gallery_date: { type: DataTypes.DATEONLY, allowNull: false },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'galleries',
});

module.exports = Gallery;
