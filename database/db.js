const { Sequelize } = require('sequelize');

// Tạo kết nối tới cơ sở dữ liệu
const sequelize = new Sequelize('MeetingApp', 'root', '12345', {
    host: 'localhost',
    dialect: 'mysql'
});

module.exports = sequelize;
