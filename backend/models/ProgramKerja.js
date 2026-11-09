const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProgramKerja = sequelize.define('ProgramKerja', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tanggal_mulai: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  tanggal_selesai: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  is_selesai: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  alasan_keterlambatan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pic_org_structure_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  pic_soldier_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  file_perencanaan: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  file_hasil: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'program_kerjas',
  underscored: true,
  timestamps: true,
});

module.exports = ProgramKerja;
