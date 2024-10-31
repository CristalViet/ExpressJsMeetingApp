const { Friend, User, Chat, ChatMember, sequelize } = require('../models');
const { Op } = require('sequelize');



const friendController = {
  // Gửi yêu cầu kết bạn
  sendFriendRequest: async (req, res) => {
    try {
      const { userId, friendId } = req.body;

      // Kiểm tra nếu yêu cầu đã tồn tại
      const existingRequest = await Friend.findOne({
        where: { user_id: userId, friend_id: friendId }
      });

      if (existingRequest) {
        return res.status(400).json({ message: 'Friend request already exists' });
      }

      // Tạo yêu cầu kết bạn mới
      await Friend.create({ user_id: userId, friend_id: friendId, status: 'pending' });
      res.status(201).json({ message: 'Friend request sent' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Chấp nhận yêu cầu kết bạn
  // Chấp nhận yêu cầu kết bạn
// Chấp nhận yêu cầu kết bạn
acceptFriendRequest: async (req, res) => {
  try {
    const { userId, friendId } = req.body;

    // Tìm yêu cầu kết bạn và cập nhật trạng thái thành 'accepted'
    const friendRequest = await Friend.findOne({
      where: { user_id: friendId, friend_id: userId, status: 'pending' }
    });

    if (!friendRequest) {
      return res.status(404).json({ message: 'Friend request not found' });
    }

    // Cập nhật trạng thái thành 'accepted'
    friendRequest.status = 'accepted';
    await friendRequest.save();

    // Tạo quan hệ bạn bè ngược lại (cả hai phía)
    await Friend.create({ user_id: userId, friend_id: friendId, status: 'accepted' });

    // Kiểm tra xem cuộc trò chuyện giữa hai người đã tồn tại chưa
    const existingChat = await Chat.findOne({
      include: [
        {
          model: ChatMember,
          as: 'chatMembers',
          where: {
            userId: {
              [Op.in]: [userId, friendId]
            }
          }
        }
      ],
    });

    if (!existingChat) {
      // Nếu chưa có, tạo cuộc trò chuyện mới
      const chat = await Chat.create({
        name: `Chat between ${userId} and ${friendId}`,
        createdBy: userId
      });

      // Thêm các thành viên vào cuộc trò chuyện
      await ChatMember.create({ chatId: chat.id, userId });
      await ChatMember.create({ chatId: chat.id, userId: friendId });
    }

    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
},




  // Từ chối yêu cầu kết bạn
  declineFriendRequest: async (req, res) => {
    try {
      const { userId, friendId } = req.body;

      // Tìm yêu cầu kết bạn và xóa nó
      const friendRequest = await Friend.findOne({
        where: { user_id: friendId, friend_id: userId, status: 'pending' }
      });

      if (!friendRequest) {
        return res.status(404).json({ message: 'Friend request not found' });
      }

      await friendRequest.destroy();
      res.status(200).json({ message: 'Friend request declined' });
    } catch (error) {
      console.error('Error declining friend request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Lấy danh sách bạn bè
  getFriendsList: async (req, res) => {
    try {
      const { userId } = req.query;

      const friends = await Friend.findAll({
        where: { user_id: userId, status: 'accepted' },
        include: [
          { model: User, as: 'friendDetail', attributes: ['id', 'username', 'email'] }
        ]
      });

      res.status(200).json(friends);
    } catch (error) {
      console.error('Error fetching friends list:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  },

  // Lấy danh sách yêu cầu kết bạn
  getFriendRequests: async (req, res) => {
    try {
      const { userId } = req.query; // Lấy userId từ query params

      // Kiểm tra nếu userId tồn tại
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      const requests = await Friend.findAll({
        where: { friend_id: userId, status: 'pending' },
        include: [{ model: User, as: 'userDetail', attributes: ['id', 'username', 'email'] }],
      });

      res.status(200).json(requests);
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

module.exports = friendController;
