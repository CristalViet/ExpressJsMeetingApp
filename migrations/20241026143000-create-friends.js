'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friends', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Tên bảng mà bạn muốn liên kết
          key: 'id'  // Khóa chính của bảng Users
        },
        onDelete: 'CASCADE', // Nếu người dùng bị xóa, các bản ghi bạn bè sẽ bị xóa theo
      },
      friend_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // Tên bảng mà bạn muốn liên kết
          key: 'id'  // Khóa chính của bảng Users
        },
        onDelete: 'CASCADE', // Nếu người bạn bị xóa, các bản ghi liên quan cũng sẽ bị xóa
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false, // Bắt buộc
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') // Mặc định là thời điểm hiện tại
      },
      nick_name: {
        type: Sequelize.STRING, // Tên hiển thị của người bạn
        allowNull: true, // Có thể để trống
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') // Cập nhật thời gian
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Friends'); // Xóa bảng Friends nếu có
  }
};
