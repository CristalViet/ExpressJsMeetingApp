const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Friend = sequelize.define('Friend', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friend_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  }, {
    tableName: 'Friends',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Friend.associate = (models) => {
    Friend.belongsTo(models.User, { foreignKey: 'user_id', as: 'userDetail' });
    Friend.belongsTo(models.User, { foreignKey: 'friend_id', as: 'friendDetail' });
  };

  return Friend;
};
