const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // Để đọc dữ liệu JSON trong request body

// Cấu hình Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Hoặc bạn có thể dùng SMTP server khác
  auth: {
    user: 'hearmeai2024@gmail.com', // Email của bạn
    pass: 'AIforLife2024'    // Mật khẩu ứng dụng (App Password)
  }
});

// API quên mật khẩu
app.post('/forget-password', async (req, res) => {
  const { email } = req.body;

  try {
    // Kiểm tra email đã được cung cấp chưa
    if (!email) {
      return res.status(400).json({ message: 'Email không được để trống!' });
    }

    // Nội dung email
    const message = `
      <h1>Yêu cầu đặt lại mật khẩu</h1>
      <p>Bạn đã yêu cầu đặt lại mật khẩu. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
      <p>Nhấn vào liên kết bên dưới để đặt lại mật khẩu:</p>
      <a href="http://localhost:5173/reset-password">Đặt lại mật khẩu</a>
    `;

    // Gửi email
    await transporter.sendMail({
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: message
    });

    // Trả về phản hồi
    res.status(200).json({ message: 'Email đặt lại mật khẩu đã được gửi!' });
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    res.status(500).json({ message: 'Có lỗi xảy ra khi gửi email!' });
  }
});

// Lắng nghe trên cổng 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên cổng ${PORT}`);
});