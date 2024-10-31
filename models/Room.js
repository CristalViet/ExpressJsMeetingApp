// models/Room.js

const { DataTypes } = require('sequelize');
const sequelize = require('../database/db'); // Cấu hình database của bạn

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  room_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.TIMESTAMP,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
  }
}, {
  tableName: 'room', // Tên bảng trong database
  timestamps: false // Vô hiệu hóa `createdAt` và `updatedAt` mặc định của Sequelize
});

module.exports = Room;
