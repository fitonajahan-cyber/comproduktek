const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrgStructure = sequelize.define('OrgStructure', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  position: { type: DataTypes.STRING(150), allowNull: false }, // jabatan
  rank: { type: DataTypes.STRING(100), allowNull: true }, // pangkat
  photo: { type: DataTypes.STRING(255), allowNull: true },
  // Menunjuk ke id atasan langsung. NULL = posisi paling atas (mis. Dansatlak).
  // Inilah yang membuat bagan bisa tersusun otomatis tanpa admin mengatur posisi manual.
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  display_order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  // Warna kotak di bagan (merah = pucuk pimpinan, oranye = pemimpin unit, teal = staf).
  box_color: {
    type: DataTypes.ENUM('merah', 'oranye', 'teal'),
    allowNull: false,
    defaultValue: 'teal',
  },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },

  // --- Detail personel yang ditampilkan di jendela pop-up saat kotak diklik ---
  // Kode karakter DISC, mis. "DC" (huruf 1 & 2 dipetakan ke warna standar DISC
  // di frontend: D=merah, I=kuning, S=hijau, C=biru). Opsional.
  disc_kode: { type: DataTypes.STRING(4), allowNull: true },
  // Label per huruf pada disc_kode, dipisah koma sesuai urutan huruf,
  // mis. "Dominasi,Ketelitian" untuk kode "DC". Opsional.
  disc_label: { type: DataTypes.STRING(255), allowNull: true },
  kekuatan_utama: { type: DataTypes.TEXT, allowNull: true },
  rekomendasi_pengembangan: { type: DataTypes.TEXT, allowNull: true },
  cara_komunikasi: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'org_structures',
});

module.exports = OrgStructure;