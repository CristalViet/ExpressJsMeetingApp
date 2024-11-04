

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Room = sequelize.define('Room', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    roomCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
   
    createdBy: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  }, {
    tableName: 'Rooms',
    timestamps: true,
  });

  Room.associate = (models) => {
    Room.belongsTo(models.User, { foreignKey: 'createdBy' });
    Room.hasMany(models.RoomMember, { foreignKey: 'roomId', as: 'members' });
  };

  return Room;
};