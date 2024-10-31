// chatController.js
const Chat = require('../models/Chat'); // Import model Chat
const Message = require('../models/Message'); // Import model Message
const User = require('../models/User'); // Import model User
const Friend = require('../models/Friend'); // Import model Friend
const ChatMember = require('../models/ChatMember'); // Import model ChatMember
const sequelize = require('../models').sequelize;

const chatController = {
  // Tạo cuộc trò chuyện giữa 2 người dùng đã kết bạn
  createChat: async (req, res) => {
    try {
      const { userId1, userId2 } = req.body;

      // Kiểm tra xem người dùng đã kết bạn chưa
      const friendRelation = await Friend.findOne({
        where: {
          user_id: userId1,
          friend_id: userId2,
          status: 'accepted'
        }
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
            where: {
              userId: [userId1, userId2]
            },
            required: true
          }
        ],
        group: ['Chat.id'],
        having: sequelize.where(sequelize.fn('COUNT', sequelize.col('chatMembers.userId')), 2)
      });

      if (existingChat) {
        return res.status(200).json({ message: 'Chat already exists', chat: existingChat });
      }

      // Nếu chưa có, tạo cuộc trò chuyện mới
      const chat = await Chat.create({
        name: `Chat between ${userId1} and ${userId2}`,
        createdBy: userId1
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

  // Gửi tin nhắn vào cuộc trò chuyện
  sendMessage: async (req, res) => {
    try {
      const { chatId, senderId, content } = req.body;

      // Kiểm tra xem người gửi có phải là thành viên của cuộc trò chuyện không
      const chatMember = await ChatMember.findOne({
        where: { chatId, userId: senderId }
      });

      if (!chatMember) {
        return res.status(403).json({ message: 'You are not a member of this chat' });
      }

      // Tạo tin nhắn mới
      const newMessage = await Message.create({
        chatId,
        senderId,
        content,
      });

      res.status(201).json({ message: 'Message sent successfully', message: newMessage });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Lấy tất cả tin nhắn trong cuộc trò chuyện
  getMessages: async (req, res) => {
    try {
      const { chatId } = req.params;

      // Lấy tất cả tin nhắn theo chatId
      const messages = await Message.findAll({
        where: { chatId },
        include: [{ model: User, as: 'sender', attributes: ['id', 'username'] }],
        order: [['timestamp', 'ASC']],
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
};

module.exports = chatController;