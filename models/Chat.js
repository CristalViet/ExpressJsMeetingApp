// models/Chat.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Chat = sequelize.define('Chat', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'private', // hoặc 'group' tùy vào trường hợp
      validate: {
        isIn: [['private', 'group']], // Chỉ cho phép hai giá trị
      },
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Chats',
    timestamps: true, // Điều này sẽ tự động thêm createdAt và updatedAt
  });

  Chat.associate = (models) => {
    Chat.hasMany(models.ChatMember, { foreignKey: 'chatId', as: 'chatMembers' });
    Chat.hasMany(models.Message, { foreignKey: 'chatId', as: 'messages' });
  };

  return Chat;
};
