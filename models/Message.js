const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'Messages',
    timestamps: true,
  });

  // Thiết lập liên kết với các mô hình khác
  Message.associate = (models) => {
    Message.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    Message.belongsTo(models.User, { foreignKey: 'senderId', as: 'sender' });
  };

  return Message;
};
