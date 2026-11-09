const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_name: { type: DataTypes.STRING(100), allowNull: false },
  sender_email: { type: DataTypes.STRING(100), allowNull: false, validate: { isEmail: true } },
  subject: { type: DataTypes.STRING(255), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: {
    type: DataTypes.ENUM('Belum Dibaca', 'Sudah Dibaca'),
    allowNull: false,
    defaultValue: 'Belum Dibaca',
  },
}, {
  tableName: 'messages',
  updatedAt: false,
});

module.exports = Message;
