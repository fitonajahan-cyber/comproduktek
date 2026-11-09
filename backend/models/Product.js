const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(150), allowNull: false },
  category: { type: DataTypes.STRING(100), allowNull: false },
  unit_pengampu: { type: DataTypes.STRING(150), allowNull: false },
  status: {
    type: DataTypes.ENUM('Aktif', 'Dalam Pengembangan', 'Nonaktif'),
    allowNull: false,
    defaultValue: 'Dalam Pengembangan',
  },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING(255), allowNull: true },
  admin_id: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'products',
});

module.exports = Product;
