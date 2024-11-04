const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RoomMember = sequelize.define('RoomMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Rooms',
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
      onDelete: 'CASCADE',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'RoomMembers',
    timestamps: true,
  });

  RoomMember.associate = (models) => {
    RoomMember.belongsTo(models.Room, { foreignKey: 'roomId', as: 'room' });
    RoomMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return RoomMember;
};