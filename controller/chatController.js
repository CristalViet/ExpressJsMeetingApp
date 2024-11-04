const { Chat, Message, User, Friend, ChatMember, sequelize } = require('../models');
const { Op } = require('sequelize');


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
  fetchChatMembers : async (req, res) => {
    try {
      const userId = parseInt(req.query.userId, 10); // Lấy `userId` từ query và chuyển thành số nguyên
  
      console.log('User ID:', userId);
  
      // Kiểm tra userId phải là số hợp lệ và khác NaN
      if (isNaN(userId)) {
        console.error('User ID không hợp lệ');
        return res.status(400).json({ message: 'User ID không hợp lệ' });
      }
  
      // Lấy danh sách chatId mà userId hiện tại đang tham gia
      const userChatMemberships = await ChatMember.findAll({
        where: {
          userId: userId,
        },
        attributes: ['chatId'], // Chỉ lấy ra `chatId`
      });
  
      // Lấy danh sách chatId mà người dùng này tham gia
      const chatIds = userChatMemberships.map((membership) => membership.chatId);
  
      if (chatIds.length === 0) {
        return res.status(200).json({ message: 'User chưa tham gia cuộc trò chuyện nào' });
      }
  
      // Lấy tất cả các thành viên khác có cùng `chatId` với `userId`
      const chatMembers = await ChatMember.findAll({
        where: {
          chatId: {
            [Op.in]: chatIds, // Chỉ lấy các thành viên thuộc các chatId mà người dùng hiện tại đang tham gia
          },
          userId: {
            [Op.ne]: userId, // Loại trừ `userId` hiện tại
          },
        },
        include: [
          {
            model: User,
            as: 'user', // Đảm bảo sử dụng alias phù hợp với cấu trúc association
            attributes: ['username', 'email'], // Chỉ lấy ra các trường cần thiết
          },
        ],
      });
  
      console.log('Chat Members:', chatMembers); // Ghi log danh sách chat members
  
      return res.status(200).json(chatMembers);
    } catch (error) {
      console.error('Error fetching chat members:', error);
      return res.status(500).json({ message: 'Error fetching chat members' });
    }
  },
  
  
  // Gửi tin nhắn vào cuộc trò chuyện
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

      // Phát tin nhắn cho các thành viên trong phòng
      io.to(chatId).emit('receiveMessage', newMessage);

      res.status(201).json({ message: 'Message sent successfully', message: newMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  

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
};

module.exports = chatController;