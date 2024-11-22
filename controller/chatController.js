const { Chat, Message, User, Friend, ChatMember, sequelize } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
// Cấu hình multer để lưu file

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder để lưu trữ file
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

const chatController = {
   // Khởi tạo Socket.io
   init: (socketIo) => {
    io = socketIo;
  },
  // Tạo cuộc trò chuyện giữa 2 người dùng đã kết bạn
  createChat: async (req, res) => {
    try {
      const { userId1, userId2 } = req.body;

      // Kiểm tra xem người dùng đã kết bạn chưa
      const friendRelation = await Friend.findOne({
        where: {
          user_id: userId1,
          friend_id: userId2,
          status: 'accepted',
        },
      });

      if (!friendRelation) {
        return res.status(400).json({ message: 'These users are not friends' });
      }

      // Kiểm tra xem cuộc trò chuyện giữa hai người đã tồn tại chưa
      const existingChat = await Chat.findOne({
        include: [
          {
            model: ChatMember,
            as: 'chatMembers',
            where: { userId: [userId1, userId2] },
            required: true,
          },
        ],
        group: ['Chat.id'],
        having: sequelize.where(sequelize.fn('COUNT', sequelize.col('chatMembers.userId')), 2),
      });

      if (existingChat) {
        return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
      }

      // Nếu chưa có, tạo cuộc trò chuyện mới
      const chat = await Chat.create({
        name: `Chat between ${userId1} and ${userId2}`,
        createdBy: userId1,
        type: 'private' // Đặt `type` là "private" cho cuộc trò chuyện
      });

      // Thêm các thành viên vào cuộc trò chuyện
      await ChatMember.create({ chatId: chat.id, userId: userId1 });
      await ChatMember.create({ chatId: chat.id, userId: userId2 });

      res.status(201).json({ message: 'Chat created successfully', chat });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  fetchChats: async (req, res) => {
    try {
      const userId = parseInt(req.query.userId, 10); // Lấy `userId` từ query và chuyển thành số nguyên
  
      if (isNaN(userId)) {
        console.error('User ID không hợp lệ');
        return res.status(400).json({ message: 'User ID không hợp lệ' });
      }
  
      // Lấy danh sách chatId mà userId hiện tại đang tham gia
      const userChatMemberships = await ChatMember.findAll({
        where: { userId },
        attributes: ['chatId'],
      });
  
      const chatIds = userChatMemberships.map((membership) => membership.chatId);
  
      if (chatIds.length === 0) {
        return res.status(200).json({ message: 'User chưa tham gia cuộc trò chuyện nào' });
      }
  
      // Lấy tất cả các cuộc trò chuyện mà user hiện tại tham gia và phân loại
      const chats = await Chat.findAll({
        where: {
          id: { [Op.in]: chatIds },
        },
        include: [
          {
            model: ChatMember,
            as: 'chatMembers',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['username', 'email'],
              },
            ],
          },
        ],
      });
  
      const formattedChats = chats.map((chat) => {
        if (chat.type === 'group') {
          return {
            id: chat.id,
            name: chat.name, // Lấy tên của group chat
            type: chat.type,
          };
        } else {
          // Chat kiểu `private`, lấy thông tin thành viên khác
          const otherMember = chat.chatMembers.find((member) => member.userId !== userId);
          return {
            id: chat.id,
            name: otherMember ? otherMember.user.username : 'Unknown User', // Tên người bạn trong cuộc trò chuyện
            type: chat.type,
            email: otherMember ? otherMember.user.email : 'No email',
          };
        }
      });
  
      return res.status(200).json(formattedChats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      return res.status(500).json({ message: 'Error fetching chats' });
    }
  },
  
  
  

  // Gửi tin nhắn vào cuộc trò chuyện
  
  

  // Lấy tất cả tin nhắn trong cuộc trò chuyện
 // Lấy tất cả tin nhắn trong cuộc trò chuyện
 getMessages: async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.findAll({
      where: { chatId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},



  // Lấy tất cả cuộc trò chuyện của người dùng
  getUserChats: async (req, res) => {
    try {
      const { userId } = req.params;

      const chats = await Chat.findAll({
        include: [
          {
            model: ChatMember,
            as: 'chatMembers',
            where: { userId },
            include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
          },
        ],
      });

      res.status(200).json(chats);
    } catch (error) {
      console.error('Error fetching user chats:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  sendMessage: async (req, res) => {
    try {
      const { chatId, senderId, content } = req.body;
  
      if (!chatId || !senderId || !content) {
        return res.status(400).json({ message: 'chatId, senderId, and content are required' });
      }
  
      // Kiểm tra xem người gửi có phải là thành viên của cuộc trò chuyện không
      const chatMember = await ChatMember.findOne({
        where: { chatId, userId: senderId },
      });
  
      if (!chatMember) {
        return res.status(403).json({ message: 'You are not a member of this chat' });
      }
  
      // Tạo tin nhắn mới và lưu vào cơ sở dữ liệu
      const newMessage = await Message.create({
        chatId,
        senderId,
        content,
      });
  
      // Lấy thông tin người gửi từ cơ sở dữ liệu
      const sender = await User.findOne({
        where: { id: senderId },
        attributes: ['id', 'username'], // Lấy các thông tin cần thiết
      });
  
      if (!sender) {
        return res.status(404).json({ message: 'Sender not found' });
      }
  
      // Gắn thông tin người gửi vào tin nhắn
      const fullMessage = {
        ...newMessage.dataValues,
        sender: {
          id: sender.id,
          username: sender.username,
        },
      };
  
      // Phát tin nhắn cho các thành viên trong phòng
      io.to(chatId).emit('receiveMessage', fullMessage);
  
      // Trả về phản hồi HTTP với thông tin đầy đủ của tin nhắn
      res.status(201).json({ message: 'Message sent successfully', message: fullMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  uploadFile: [
    upload.single('file'),
    async (req, res) => {
      try {
        const { chatId, senderId } = req.body;
        const filePath = req.file.path;

        // Kiểm tra xem người gửi có phải là thành viên của cuộc trò chuyện không
        const chatMember = await ChatMember.findOne({
          where: { chatId, userId: senderId },
        });

        if (!chatMember) {
          return res.status(403).json({ message: 'You are not a member of this chat' });
        }

        // Tạo tin nhắn mới và lưu thông tin file vào cơ sở dữ liệu
        const newMessage = await Message.create({
          chatId,
          senderId,
          content: '', // Để trống content nếu chỉ gửi file
          filePath,
        });

        // Phát tin nhắn chứa file cho tất cả các thành viên khác trong phòng chat
        if (io) {
          io.to(chatId).emit('receiveMessage', {
            ...newMessage.dataValues, // Bao gồm tất cả thông tin tin nhắn
            filePath: `${filePath}`,  // Đảm bảo filePath có đường dẫn chính xác
          });
        }

        console.log('File message emitted: ', newMessage);

        res.status(201).json({ message: 'File sent successfully', message: newMessage });
      } catch (error) {
        console.error('Error sending file:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    },
  ],
  
  // Trong hàm createGroupChat
  createGroupChat: async (req, res) => {
    try {
      let { userIds, groupName, userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
  
      // Thêm người tạo vào danh sách thành viên nếu chưa có
      if (!userIds.includes(userId)) {
        userIds.push(userId);
      }
  
      // Tạo cuộc trò chuyện nhóm mới
      const chat = await Chat.create({
         name: groupName, 
         createdBy: userId,
         type: 'group'
        });
  
      // Thêm các thành viên vào nhóm
      await Promise.all(
        userIds.map(async (memberId) => {
          return await ChatMember.create({ chatId: chat.id, userId: memberId });
        })
      );
  
      // Phát sự kiện `groupCreated` cho tất cả thành viên, bao gồm người tạo
      const io = req.app.get('io');
      if (io) {
        userIds.forEach((memberId) => {
          io.to(`user_${memberId}`).emit('groupCreated', { chat });
        });
      } else {
        console.error('Socket.io instance is not available');
      }
  
      res.status(201).json({ message: 'Group chat created successfully', chat });
    } catch (error) {
      console.error('Error creating group chat:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  
  
  
};

module.exports = chatController;