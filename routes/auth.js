const express = require('express');
const bcrypt = require('bcrypt');
const db=require('../database/db');
const crypto = require('crypto'); // Import chính xác module crypto

const sendEmail=require("../services/emailService")

const router = express.Router();

const { Friend, User, Chat, ChatMember, sequelize } = require('../models');

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

// Xóa người dùng theo ID
router.delete('/users/:id', userController.deleteUser);

// router.post('/forget-password', async (req, res) => {
//     const { email } = req.body;
//     // console.log("Da toi")
//     try {
//       // Tìm người dùng qua email
//       const user = await User.findOne({ where: { email } });
//       if (!user) return res.status(404).json({ message: 'Email không tồn tại' });
  
//       // Tạo token reset
//       const resetToken = crypto.randomBytes(32).toString('hex');
  
//       // Lưu token mã hóa vào DB
//       user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
//       user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token hết hạn sau 15 phút
//       await user.save();
  
//       // Gửi email reset
//       const resetUrl = `http://localhost:5173/  -password/${resetToken}`;
//       const message = `
//         <h1>Bạn đã yêu cầu đặt lại mật khẩu</h1>
//         <p>Click vào liên kết bên dưới để đặt lại mật khẩu:</p>
//         <a href="${resetUrl}" target="_blank">Đặt lại mật khẩu</a>
//       `;
  
//       await sendEmail(email, 'Đặt lại mật khẩu', message);
  
//       res.status(200).json({ message: 'Email đặt lại mật khẩu đã được gửi!' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Có lỗi xảy ra!' });
//     }
// });

router.post('/forget-password', async (req, res) => {
    const { email } = req.body;
  
    try {
      // Kiểm tra xem email có được cung cấp không
      if (!email) {
        return res.status(400).json({ message: 'Email không được để trống!' });
      }
  
      // Tìm người dùng với email được cung cấp
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: 'Người dùng với email này không tồn tại!' });
      }
  
      // Tạo token đặt lại mật khẩu và thời gian hết hạn
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpire = Date.now() + 15 * 60 * 1000; // Hết hạn sau 15 phút
  
      // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
      user.resetToken = resetToken;
      user.resetTokenExpire = resetTokenExpire;
      await user.save();
  


      console.log(user)
      // Tạo liên kết đặt lại mật khẩu
      const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
  
      // Nội dung email
      const subject = 'Đặt lại mật khẩu';
      const html = `
        <h1>Yêu cầu đặt lại mật khẩu</h1>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetLink}">Đặt lại mật khẩu</a>
      `;
  
      // Gửi email
      await sendEmail(email, subject, html);
  
      // Phản hồi thành công
      res.status(200).json({ message: 'Email đặt lại mật khẩu đã được gửi!' });
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email!' });
    }
  });
  const { User } = require('../models'); // Import model User
const { Op } = require('sequelize'); // Import Sequelize Operators

router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // Tìm người dùng có token và token còn hiệu lực
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpire: { [Op.gt]: Date.now() }, // Token phải còn hiệu lực
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Token hợp lệ
    res.status(200).json({ message: 'Token is valid', userId: user.id });
  } catch (error) {
    console.error('Error validating reset token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;