const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgramKerjaTim = sequelize.define('ProgramKerjaTim', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  proker_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  soldier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'program_kerja_tims',
  underscored: true,
  timestamps: true,
});

module.exports = ProgramKerjaTim;
