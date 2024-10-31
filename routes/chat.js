const express = require('express');
const chatController = require('../controller/chatController');

const router = express.Router();

// Tạo cuộc trò chuyện mới
router.post('/create', chatController.createChat);

// Gửi tin nhắn
router.post('/send', chatController.sendMessage);

// Lấy tất cả tin nhắn trong cuộc trò chuyện
router.get('/:chatId/messages', chatController.getMessages);

// Lấy tất cả cuộc trò chuyện của người dùng
router.get('/user/:userId', chatController.getUserChats);

module.exports = router;
