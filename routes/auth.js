const express = require('express');
const bcrypt = require('bcrypt');
const db=require('../database/db');

const router = express.Router();
const userController=require('../controller/userController')

// Bộ nhớ tạm để lưu thông tin user (thay vì dùng database)
const users = [];

//Dang nhap
router.post('/login', userController.loginUser);


// Tạo người dùng mới
router.post('/users', userController.createUser);

// Lấy tất cả người dùng
router.get('/users', userController.getAllUsers);

// Lấy thông tin người dùng theo ID
router.get('/users/:id', userController.getUserById);

// Cập nhật thông tin người dùng theo ID
router.put('/users/:id', userController.updateUser);



router.put('/:id', userController.updateUser); // Cập nhật thông tin người dùng
router.put('/users/:id/password', userController.updatePassword);

module.exports = router;