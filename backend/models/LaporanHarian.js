const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanHarian = sequelize.define('LaporanHarian', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  soldier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tanggal: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
}, {
  tableName: 'laporan_harians',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['soldier_id', 'tanggal'],
    }
  ]
});

module.exports = LaporanHarian;
