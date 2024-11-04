'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Rooms', 'name');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Rooms', 'name', {
      type: Sequelize.STRING(100),
      allowNull: true,
    });
  }
};