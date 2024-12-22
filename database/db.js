const { Sequelize } = require('sequelize');

// Tạo kết nối tới cơ sở dữ liệu
const sequelize = new Sequelize('MeetingApp', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
});
sequelize.sync({ alter: true })
  .then(() => console.log("Database synchronized"))
  .catch(console.error);
module.exports = sequelize;
