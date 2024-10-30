const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Chats',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    filePath: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'Documents',
    timestamps: true,
  });

  // Thiết lập mối quan hệ
  Document.associate = function(models) {
    Document.belongsTo(models.Chat, { foreignKey: 'chatId', as: 'chat' });
    Document.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Document;
};
