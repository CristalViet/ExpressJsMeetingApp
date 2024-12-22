const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const userRoutes = require("./routes/auth");
const friendRoutes = require('./routes/friend');
const chatRoutes = require('./routes/chat');
const roomRoutes=require('./routes/room')
const documentRoutes = require('./routes/document');


const { Chat, Message, User, Friend, ChatMember } = require('./models');


const chatController = require('./controller/chatController');
const friendController = require('./controller/friendController');

const jwt = require('jsonwebtoken');
require('dotenv').config();
const sequelize = require('./database/db'); // Đường dẫn đến file kết nối
const Room = require('./models/Room')(sequelize);   
const app = express();
const cors = require('cors');

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/friends', friendRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/chats', chatRoutes);

app.use('/api/meeting', roomRoutes);
app.use('/api/documents', documentRoutes);
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
  socket.on('offer',(offer,roomId)=>{
    console.log("Nhan duoc offer tu client:",socket.id);
    socket.broadcast.to(  roomId).emit('offer',offer);
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

  // Tham gia vào phòng WebRTC
  socket.on('join-room',(roomId,userId)=>{
    socket.join(roomId);
    console.log(`${socket.id} da tham gia phong ${roomId}`);
    const room = Room.findOne({where:{  roomCode: roomId  }})
    room_code=roomId
    if(!room){
      room=new Room({room_code})
    }
  });

  // Gửi tin nhắn trong phòng chat
  socket.on('sendMessage', async (message) => {
    try {
      console.log('Tin nhắn nhận được từ client:', message);
  
      // Lấy thông tin người gửi từ cơ sở dữ liệu
      const sender = await User.findOne({
        where: { id: message.senderId },
        attributes: ['id', 'username'],
      });
  
      if (!sender) {
        console.error('Người gửi không tồn tại');
        return;
      }
  
      // Bổ sung thông tin người gửi vào tin nhắn
      const enrichedMessage = {
        ...message,
        sender: {
          id: sender.id,
          username: sender.username,
        },
      };
  
      // Đảm bảo gửi `filePath` khi có file
      if (message.filePath) {
        enrichedMessage.filePath = message.filePath;
      }
  
      // Phát tin nhắn cho tất cả các client trong phòng chat
      io.to(message.chatId).emit('receiveMessage', enrichedMessage);
      console.log('Đã phát tin nhắn:', enrichedMessage);
    } catch (error) {
      console.error('Lỗi khi xử lý sự kiện sendMessage:', error);
    }
  });
  socket.on('sendMessageMeeting', (message) => {
    const { text, roomId, userId, userName } = message;
    io.to(roomId).emit('receiveMessageMeeting', { text, userId, userName });
  });
  
  
  
  
  
  

  socket.on('createGroup', ({ chat, userIds }) => {
    try {
      console.log(`Emitting group creation for chat: ${chat.name} to userIds:`, userIds); // Log kiểm tra
      // Phát sự kiện `groupCreated` đến tất cả các user trong danh sách `userIds`
      userIds.forEach((memberId) => {
        io.to(`user_${memberId}`).emit('groupCreated', { chat });
      });
  
      console.log(`Nhóm ${chat.name} đã được phát sóng đến các thành viên!`);
    } catch (error) {
      console.error('Error emitting group creation:', error);
      socket.emit('error', { message: 'Error emitting group creation' });
    }
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
