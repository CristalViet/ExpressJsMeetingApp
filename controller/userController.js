const bcrypt = require('bcrypt');
const { User } = require('../models'); // Đảm bảo import từ models/index.js
const { json } = require('sequelize');
const jwt = require('jsonwebtoken');  // Sử dụng JWT để tạo token


const userController = {
    createUser: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // Kiểm tra email đã tồn tại hay chưa
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "Email is already registered" });
            }

            // Hash mật khẩu trước khi lưu
            const hashedPassword = await bcrypt.hash(password, 10);

            // Tạo người dùng mới
            const newUser = await User.create({
                username,
                email,
                password: hashedPassword
            });

            // Phát sự kiện tới tất cả client để thông báo có người dùng mới
            req.io.emit('newUserRegistered', {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            });

            res.status(201).json({
                message: "User created successfully",
                user: newUser
            });

        } catch (error) {
            console.error("Error creating user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.findAll(); // Thêm `await` để chờ kết quả
            res.status(200).json(users);

        } catch (error) {
            console.error("Error fetching users:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    getUserById: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await User.findByPk(userId); // Thêm `await`

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json(user);
        } catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    updateUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const { username, email, password } = req.body;

            // Kiểm tra xem người dùng có tồn tại không
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Cập nhật thông tin người dùng
            user.username = username || user.username;
            user.email = email || user.email;

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword; // Cập nhật password đã được hash
            }

            await user.save();

            res.status(200).json({
                message: "User updated successfully",
                user
            });

        } catch (error) {
            console.error("Error updating user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },

    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;

            // Kiểm tra người dùng có tồn tại hay không
            const user = await User.findByPk(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Xóa người dùng
            await user.destroy();

            res.status(200).json({ message: "User deleted successfully" });

        } catch (error) {
            console.error("Error deleting user", error);
            res.status(500).json({ message: "Internal server error" });
        }
    },
    loginUser: async (req, res) => {
        try {
          const { email, password } = req.body;
    
          // Sử dụng User để tìm thông tin người dùng
          const user = await User.findOne({ where: { email } });
          if (!user) {
            return res.status(400).json({ message: "User not found" });
          }
    
          const validPassword = await bcrypt.compare(password, user.password);
          if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
          }
    
          const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET, // Khóa bí mật để mã hóa JWT (cần thiết lập trong .env)
            { expiresIn: '1h' }
          );
    
          res.status(200).json({
            message: 'Login successful',
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
            },
          });
        } catch (error) {
          console.error('Error logging in:', error);
          res.status(500).json({ message: "Internal server error" });
        }
      }
};

module.exports = userController;