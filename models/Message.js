// models/Message.js
const { Sequelize, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Chats', // Tên bảng Chats
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Tên bảng Users
        key: 'id'
      },
      onDelete: 'SET NULL'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true, // Cho phép null vì có thể tin nhắn chỉ có file đính kèm
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: true, // Trường này chứa đường dẫn file, có thể là null nếu không có file đính kèm
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    }
  }, {
    tableName: 'Messages',
    timestamps: true, // Điều này sẽ tự động tạo các trường createdAt và updatedAt
  });

  // Định nghĩa quan hệ giữa các bảng
  Message.associate = (models) => {
    // Message thuộc về một Chat
    Message.belongsTo(models.Chat, {
      foreignKey: 'chatId',
      onDelete: 'CASCADE',
    });
  
    // Message thuộc về một User (sender)
    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender', // Sử dụng alias là 'sender'
      onDelete: 'SET NULL',
    });
  };

  return Message;
};
