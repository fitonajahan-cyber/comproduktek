const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const JadwalPiket = sequelize.define('JadwalPiket', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  soldier_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  tanggal_piket: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    unique: true,
  },
  bulan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'absent'),
    defaultValue: 'scheduled',
  },
  keterangan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status_usulan: {
    type: DataTypes.ENUM('completed', 'absent'),
    allowNull: true,
  },
  keterangan_usulan: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approval_status: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
  },
  swap_with_schedule_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  swap_requester_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  swap_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  swap_approval_status: {
    type: DataTypes.ENUM('none', 'pending', 'approved', 'rejected'),
    defaultValue: 'none',
  },
  swap_reviewed_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  reviewed_by_admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'jadwal_pikets',
  underscored: true,
  timestamps: true,
});

module.exports = JadwalPiket;
