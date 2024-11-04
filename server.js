const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const userRoutes = require("./routes/auth");
const friendRoutes = require('./routes/friend');
const chatRoutes = require('./routes/chat');
const chatController = require('./controller/chatController');
const friendController = require('./controller/friendController'); // Thêm dòng này
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/friends', friendRoutes);
app.use('/api/chats', chatRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Gắn `io` vào `req` trong các routes để dùng trong controller
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Khởi tạo Socket.io cho `chatController` và `friendController`
chatController.init(io);
friendController.init(io); // Thêm dòng này để khởi tạo friendController với Socket.io

// Middleware để xác thực token JWT cho Socket.io (nếu cần)
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) return next(new Error('Authentication error: No token provided'));
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = decoded;
//     next();
//   } catch (error) {
//     return next(new Error('Authentication error: Invalid token'));
//   }
// });

// Định nghĩa một route đơn giản cho HTTP request

// Xử lý các sự kiện Socket.io cho yêu cầu kết bạn và WebRTC
io.on('connection', (socket) => {
  console.log('Một client đã kết nối:', socket.id);

  // Tham gia vào phòng của người dùng dựa trên userId để gửi thông báo cá nhân
  const userId = socket.handshake.query.userId;
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  }

  // Phát sự kiện đến người dùng nhận yêu cầu
socket.on('friendRequestSent', ({ userId, friendId }) => {
  io.to(`user_${friendId}`).emit('friendRequestReceived', { fromUserId: userId });
});

  // Thêm sự kiện khi có người dùng mới đăng ký
  socket.on('newUserRegistered', (newUser) => {
    // Phát sự kiện cho tất cả client (ngoại trừ chính client vừa đăng ký)
    socket.broadcast.emit('newUserRegistered', newUser);
  });

  // WebRTC events
  socket.on('offer', (offer, roomId) => {
    console.log("Received offer from client:", socket.id);
    socket.broadcast.to(roomId).emit('offer', offer);
  });

  socket.on('answer', (answer, roomId) => {
    console.log("Received answer from client:", socket.id);
    socket.broadcast.to(roomId).emit("answer", answer);
  });

  socket.on('ice-candidate', (candidate, roomId) => {
    console.log("Received ICE candidate from client:", socket.id);
    socket.broadcast.to(roomId).emit('ice-candidate', candidate);
  });

  // Tham gia vào phòng WebRTC
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} đã tham gia phòng ${roomId}`);
  });

  // Gửi tin nhắn trong phòng chat
  socket.on('sendMessage', (message) => {
    console.log('Received message:', message);
    io.to(message.chatId).emit('receiveMessage', message);
  });

  // Tham gia vào phòng chat
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`Client ${socket.id} joined chat room ${chatId}`);
  });

  // Ngắt kết nối
  socket.on('disconnect', () => {
    console.log('Client đã ngắt kết nối:', socket.id);
  });
});

// Khởi động server tại cổng 3009
const PORT = 3009;
server.listen(PORT, () => {
  console.log(`Server HTTP đang chạy tại http://localhost:${PORT}`);
});
