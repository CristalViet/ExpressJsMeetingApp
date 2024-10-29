const { DataTypes } = require('sequelize');
const sequelize = require('../database/db');
const User = require('./User'); // Import model User

const Friend = sequelize.define('Friend', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  friend_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
  },
  nick_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Friends',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

// Thiết lập mối quan hệ
// Thiết lập mối quan hệ
Friend.belongsTo(User, { foreignKey: 'user_id', as: 'userDetail' });
Friend.belongsTo(User, { foreignKey: 'friend_id', as: 'friendDetail' });


module.exports = Friend;
