const nodemailer = require('nodemailer');

// Cấu hình tài khoản Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  auth: {

    user: 'vietvaky@gmail.com', // Email của bạn
    pass: 'spffmriiblhwnyol' // Mật khẩu ứng dụng
  }
});


// Hàm gửi email
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: 'Tong dai ba dao',
    to,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
