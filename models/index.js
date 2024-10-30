const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Đọc tất cả các file model trong thư mục hiện tại và thêm vào đối tượng `db`
fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const modelModule = require(path.join(__dirname, file));
    let model;

    // Kiểm tra nếu `modelModule` là một lớp (`class`)
    if (typeof modelModule === 'function' && modelModule.prototype instanceof Sequelize.Model) {
      // Nếu là một lớp thì sử dụng `new`
      model = new modelModule(sequelize, Sequelize.DataTypes);
    } else if (typeof modelModule === 'function') {
      // Nếu là hàm thông thường, gọi trực tiếp
      model = modelModule(sequelize, Sequelize.DataTypes);
    } else {
      throw new Error(`Model not properly defined or exported in file: ${file}`);
    }

    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
