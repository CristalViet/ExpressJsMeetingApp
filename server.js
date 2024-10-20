const express = require('express');
const http = require('http'); // Thay https bằng http
const { Server } = require('socket.io');
const userRoutes=require("./routes/auth")
require('dotenv').config();  // Tải các biến môi trường từ file .env


// Tạo ứng dụng Express
const app = express();


// Middleware để xử lý JSON
app.use(express.json());

app.use('/api',userRoutes);

// Tạo server HTTP từ Express
const server = http.createServer(app); // Sử dụng http.createServer

// Tạo socket.io kết hợp với server HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép mọi nguồn kết nối (tuỳ chỉnh lại khi cần)
    methods: ['GET', 'POST'],
  },
});

// Định nghĩa một route đơn giản cho HTTP request
app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với server HTTP kết hợp socket.io!');
});

// Lắng nghe sự kiện kết nối từ client sử dụng socket.io
io.on('connection', (socket) => {
  console.log('Một client đã kết nối:', socket.id);

  // Xử lý sự kiện từ client
  socket.on('sendMessage', (message) => {
    console.log('Tin nhắn nhận được từ client:', message);
    io.emit('receiveMessage', message); // Phát tin nhắn cho tất cả client kết nối
  });
  socket.on('', (message) => {
    console.log('Tin nhắn nhận được từ client:', message);
    io.emit('receiveMessage', message); // Phát tin nhắn cho tất cả client kết nối
  });

  // Xử lý sự kiện ngắt kết nối từ client
  socket.on('disconnect', () => {
    console.log('Client đã ngắt kết nối:', socket.id);
  });
});

// Khởi động server tại cổng 3009
const PORT = 3009;
server.listen(PORT, () => {
  console.log(`Server HTTP đang chạy tại http://localhost:${PORT}`);
});
