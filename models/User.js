const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resetToken: {
      type: DataTypes.STRING, // Token đặt lại mật khẩu
      allowNull: true,
    },
    resetTokenExpire: {
      type: DataTypes.DATE, // Thời gian hết hạn token
      allowNull: true,
    },
  }, {
    tableName: 'Users',
    timestamps: true,
  });

  User.associate = (models) => {
    User.hasMany(models.Friend, { foreignKey: 'user_id', as: 'friends' });
    User.hasMany(models.ChatMember, { foreignKey: 'userId', as: 'chatMembers' });
    User.hasMany(models.Message, { foreignKey: 'senderId', as: 'messages' });
    User.hasMany(models.RoomMember, { foreignKey: 'userId', as: 'roomMembers' });
    User.hasMany(models.Room, { foreignKey: 'createdBy', as: 'rooms' });
  };

  return User;
};
