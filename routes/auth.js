const express = require('express');
const bcrypt = require('bcrypt');


const router = express.Router();

// Bộ nhớ tạm để lưu thông tin user (thay vì dùng database)
const users = [];



// Đăng ký tài khoản người dùng
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).json({ message: 'User đã tồn tại!' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Lưu user vào bộ nhớ tạm
    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: 'Đăng ký thành công!' });
});



module.exports = router;