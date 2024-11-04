const { Friend, User, Chat, ChatMember, sequelize } = require('../models');
const { Op } = require('sequelize');

let io; // Biến để lưu trữ socket.io instance

const friendController = {
  // Khởi tạo Socket.io
  init: (socketIo) => {
    io = socketIo;
  },

  getSuggestedFriends: async (req, res) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Lấy tất cả bạn bè của user hiện tại
      const friends = await Friend.findAll({
        where: {
          [Op.or]: [
            { user_id: userId },
            { friend_id: userId }
          ]
        },
        attributes: ['user_id', 'friend_id', 'status']
      });

      // Lọc ra các ID đã là bạn bè hoặc đang trong trạng thái "pending"
      const acceptedFriendIds = friends
        .filter(f => f.status === 'accepted')
        .map(f => (f.user_id === parseInt(userId) ? f.friend_id : f.user_id));

      // Lọc ra các yêu cầu kết bạn có trạng thái "pending"
      const pendingFriendIds = friends
        .filter(f => f.status === 'pending')
        .map(f => (f.user_id === parseInt(userId) ? f.friend_id : f.user_id));

      // Lấy tất cả người dùng ngoại trừ chính mình và những người đã là bạn bè
      const suggestedFriends = await User.findAll({
        where: {
          id: {
            [Op.and]: [
              { [Op.ne]: userId },
              { [Op.notIn]: acceptedFriendIds }
            ]
          }
        },
        attributes: ['id', 'username', 'email']
      });

      // Gắn trạng thái `pending` vào những người có yêu cầu đang chờ xử lý
      const result = suggestedFriends.map(user => ({
        ...user.toJSON(),
        status: pendingFriendIds.includes(user.id) ? 'pending' : null
      }));

      res.status(200).json(result);
    } catch (error) {
      console.error('Error fetching suggested friends:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Gửi yêu cầu kết bạn
  sendFriendRequest: async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      // Kiểm tra yêu cầu kết bạn đã tồn tại hai chiều
      const existingRequest = await Friend.findOne({
        where: {
          [Op.or]: [
            { user_id: userId, friend_id: friendId },
            { user_id: friendId, friend_id: userId }
          ],
          status: 'pending'
        }
      });
  
      // Nếu yêu cầu kết bạn đã tồn tại, trả về lỗi
      if (existingRequest) {
        return res.status(400).json({ message: 'Friend request already exists or pending approval' });
      }
  
      // Tạo yêu cầu kết bạn mới với trạng thái "pending"
      await Friend.create({ user_id: userId, friend_id: friendId, status: 'pending' });
      res.status(201).json({ message: 'Friend request sent' });
  
      // Phát sự kiện đến user nhận yêu cầu kết bạn
      if (io) {
        io.to(`user_${friendId}`).emit('friendRequestReceived', { fromUserId: userId });
      }
    } catch (error) {
      console.error('Error sending friend request:', error.message, error.stack);
      res.status(500).json({ message: 'Internal server error' });
    }
  },


  // Hủy yêu cầu kết bạn
  // Hủy yêu cầu kết bạn
  cancelFriendRequest: async (req, res) => {
    try {
      const { userId, friendId } = req.query;
  
      if (!userId || !friendId) {
        return res.status(400).json({ message: 'User ID and Friend ID are required' });
      }
  
      const friendRequest = await Friend.findOne({
        where: {
          [Op.or]: [
            { user_id: userId, friend_id: friendId, status: 'pending' },
            { user_id: friendId, friend_id: userId, status: 'pending' }
          ]
        }
      });
  
      if (!friendRequest) {
        return res.status(404).json({ message: 'Friend request not found' });
      }
  
      // Xóa yêu cầu kết bạn trước khi phát sự kiện
      await friendRequest.destroy();
  
      // Gửi lại phản hồi thành công
      res.status(200).json({ message: 'Friend request canceled' });
  
      // Sau khi hủy thành công, phát sự kiện socket
      io.to(`user_${friendId}`).emit('friendRequestCanceled', { fromUserId: userId });
    } catch (error) {
      console.error('Error canceling friend request:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
  


  // Chấp nhận yêu cầu kết bạn
  acceptFriendRequest: async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      const friendRequest = await Friend.findOne({
        where: {
          [Op.or]: [
            { user_id: friendId, friend_id: userId, status: 'pending' },
            { user_id: userId, friend_id: friendId, status: 'pending' }
          ]
        }
      });
  
      if (!friendRequest) {
        return res.status(404).json({ message: 'Friend request not found' });
      }
  
      // Cập nhật trạng thái của yêu cầu kết bạn
      friendRequest.status = 'accepted';
      await friendRequest.save();
  
      // Tạo quan hệ bạn bè ngược lại
      await Friend.create({ user_id: userId, friend_id: friendId, status: 'accepted' });
  
      // Kiểm tra nếu có cuộc trò chuyện hiện có giữa hai người dùng
      const userChats = await ChatMember.findAll({
        where: { userId: userId },
        attributes: ['chatId']
      });
      const friendChats = await ChatMember.findAll({
        where: { userId: friendId },
        attributes: ['chatId']
      });
  
      // Tạo tập hợp các `chatId` để kiểm tra cuộc trò chuyện chung
      const userChatIds = new Set(userChats.map(chat => chat.chatId));
      const existingChat = friendChats.find(chat => userChatIds.has(chat.chatId));
  
      // Nếu không có cuộc trò chuyện chung, tạo cuộc trò chuyện mới
      if (!existingChat) {
        const chat = await Chat.create({
          name: `Chat between ${userId} and ${friendId}`,
          createdBy: userId
        });
  
        await ChatMember.bulkCreate([
          { chatId: chat.id, userId },
          { chatId: chat.id, userId: friendId }
        ]);
      }
  
      res.status(200).json({ message: 'Friend request accepted' });
  
      // Phát sự kiện socket tới các user liên quan
      io.to(`user_${friendId}`).emit('friendRequestAccepted', { fromUserId: userId, toUserId: friendId });
      io.to(`user_${userId}`).emit('friendRequestAccepted', { fromUserId: userId, toUserId: friendId });

    } catch (error) {
      console.error('Error accepting friend request:', error.message, error.stack);
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

      // Gửi sự kiện socket tới client liên quan
      io.to(`user_${friendId}`).emit('friendRequestDeclined', { fromUserId: userId });
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
