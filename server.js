const express = require('express');
const http = require('http'); // Thay https bằng http
const { Server } = require('socket.io');
const userRoutes = require("./routes/auth");
const jwt = require('jsonwebtoken');
require('dotenv').config();  // Tải các biến môi trường từ file .env

// Tạo ứng dụng Express
const app = express();

// Middleware để xử lý JSON
app.use(express.json());

app.use('/api', userRoutes);

// Tạo server HTTP từ Express
const server = http.createServer(app); // Sử dụng http.createServer

// Tạo socket.io kết hợp với server HTTP
const io = new Server(server, {
  cors: {
    origin: '*', // Cho phép mọi nguồn kết nối (tuỳ chỉnh lại khi cần)
    methods: ['GET', 'POST'],
  },
});

// Middleware để xác thực token JWT cho Socket.io
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token; // Lấy token từ phần auth của handshake

//   if (!token) {
//     return next(new Error('Authentication error: No token provided'));
//   }

//   try {
//     // Giải mã và xác thực token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); // Sử dụng JWT_SECRET từ file .env
//     socket.user = decoded; // Lưu thông tin người dùng vào socket để sử dụng sau này
//     next(); // Cho phép tiếp tục kết nối
//   } catch (error) {
//     return next(new Error('Authentication error: Invalid token'));
//   }
// });

// Định nghĩa một route đơn giản cho HTTP request
app.get('/', (req, res) => {
  res.send('Chào mừng bạn đến với server HTTP kết hợp socket.io!');
});

// Lắng nghe sự kiện kết nối từ client sử dụng socket.io
io.on('connection', (socket) => {
  console.log('Một client đã kết nối:', socket.id);

  // Xử lý sự kiện từ client (ví dụ gửi tin nhắn)
  socket.on('sendMessage', (message) => {
    console.log('Tin nhắn nhận được từ client:', message);
    io.emit('receiveMessage', message); // Phát tin nhắn cho tất cả client kết nối
  });
  // Lang nghe su kien offer tu mot client
  socket.on('offer',(offer,roomId)=>{
    console.log("Nhan duoc offer tu client:",socket.id);
    socket.broadcast.to(roomId).emit('offer',offer);
  });
  socket.on('answer',(answer,roomId)=>{
    console.log("Nhan duoc answer tu client",socket.id);

    socket.broadcast.to(roomId).emit("answer",answer);
  });



  socket.on('ice-candidate',(candidate,roomId)=>{
    console.log("NHan duoc ICE candidate tu client:",socket.id);
    //Phat lai candidate den peer khac trong room
    socket.broadcast.to(roomId).emit('ice-candidate',candidate);
  });

  socket.on('join-room',(roomId)=>{
    socket.join(roomId);
    console.log(`${socket.id} da tham gia phong ${roomId}`);
  })


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
