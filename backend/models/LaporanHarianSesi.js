const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LaporanHarianSesi = sequelize.define('LaporanHarianSesi', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  laporan_harian_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  urutan_sesi: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  aktivitas: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  output_hasil: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'laporan_harian_sesis',
  timestamps: true,
  underscored: true,
});

module.exports = LaporanHarianSesi;
