const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');

// Gửi yêu cầu kết bạn
router.post('/request', friendController.sendFriendRequest);

// Chấp nhận yêu cầu kết bạn
router.post('/accept', friendController.acceptFriendRequest);

// Từ chối yêu cầu kết bạn
router.post('/decline', friendController.declineFriendRequest);

// Lấy danh sách bạn bè
router.get('/list', friendController.getFriendsList);

// Lấy danh sách yêu cầu kết bạn (cả gửi và nhận)
router.get('/requests', friendController.getFriendRequests);

module.exports = router;
