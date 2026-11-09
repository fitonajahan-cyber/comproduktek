const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Soldier = sequelize.define('Soldier', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  full_name: { type: DataTypes.STRING(150), allowNull: true },
  photo: { type: DataTypes.STRING(255), allowNull: true },
  pangkat: { type: DataTypes.STRING(100), allowNull: true },
  status: { type: DataTypes.ENUM('aktif', 'nonaktif'), allowNull: false, defaultValue: 'aktif' },
  org_structure_id: { type: DataTypes.INTEGER, allowNull: true },
  must_change_password: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
}, {
  tableName: 'soldiers',
});

module.exports = Soldier;
