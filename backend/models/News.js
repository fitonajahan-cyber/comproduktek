const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Kegiatan Siber'
  },
  thumbnail: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  news_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  admin_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'news',
  timestamps: true, // Ubah ke false jika tabel MySQL kamu tidak punya kolom createdAt & updatedAt
  underscored: true
});

module.exports = News;