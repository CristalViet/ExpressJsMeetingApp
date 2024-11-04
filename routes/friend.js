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
// Lấy danh sách gợi ý kết bạn kèm trạng thái
router.get('/suggested', friendController.getSuggestedFriends);
//Hủy yêu cầu kết bạn
// Hủy yêu cầu kết bạn
router.delete('/cancel', friendController.cancelFriendRequest);

module.exports = router;
