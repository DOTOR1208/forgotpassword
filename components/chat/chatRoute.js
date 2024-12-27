const express = require('express');
const chatController = require('./chatController');
const router = express.Router();

router.get('/', chatController.renderChatPage);
router.post('/create', chatController.createChat);
router.post('/send', chatController.sendMessage);

module.exports = router;
