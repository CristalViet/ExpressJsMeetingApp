const express = require('express');
const chatController = require('../controller/chatController');

const router = express.Router();

// Tạo cuộc trò chuyện mới
router.post('/create', chatController.createChat);

// Gửi tin nhắn
router.post('/send', chatController.sendMessage);

// Lấy tất cả tin nhắn trong cuộc trò chuyện
router.get('/:chatId/messages', chatController.getMessages);
router.get('/chatmembers', chatController.getChatMembers);

// Lấy tất cả cuộc trò chuyện của người dùng
router.get('/user/:userId', chatController.getUserChats);
router.get('/chatmembers/list', chatController.fetchChats);
router.post('/upload', chatController.uploadFile);
// Tạo cuộc trò chuyện nhóm
router.post('/group/create', chatController.createGroupChat);

module.exports = router;
