const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ChatMember = sequelize.define('ChatMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    tableName: 'ChatMembers',
    timestamps: true, // Điều này sẽ tự động tạo các trường 'createdAt' và 'updatedAt'
    createdAt: 'createdAt', // Đảm bảo tên trường là 'createdAt'
    updatedAt: 'updatedAt'  // Đảm bảo tên trường là 'updatedAt'
  });

  ChatMember.associate = (models) => {
    ChatMember.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    ChatMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return ChatMember;
};
