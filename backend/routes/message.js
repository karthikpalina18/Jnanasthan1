const express = require('express');
const jwt = require('jsonwebtoken'); // Add this to require jwt
const Message = require('../models/Message');
const User = require('../models/User'); // Assuming you have a User model
const protect = require('../middleware/authMiddleware');
const Notification = require('../models/Notification'); 

const router = express.Router();
   const createNotification = async (userId, message, type) => {
     try {
       const notification = new Notification({
         user: userId,
         message,
         type
       });

       await notification.save();
     } catch (error) {
       console.error('Error saving notification:', error);
     }
   };
   

// Send a message
router.post('/', protect, async (req, res) => {
  const { receiver, content } = req.body;

  if (!receiver || !content) {
    return res.status(400).json({ error: 'Receiver and content are required' });
  }

  try {
    const message = new Message({
      sender: req.user._id, // ✅ should be ObjectId
      receiver,             // ✅ should already be ObjectId from frontend
      content
    });

    await message.save();
    const notification = `${req.user.username} has sent you a message.`;
    await createNotification(receiver, notification, 'connection-request');

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Get messages between the logged-in user and another user using their email
router.get('/:receiverEmail', protect, async (req, res) => {
  const { receiverEmail } = req.params;

  try {
    // Find receiver user by email
    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) return res.status(404).json({ message: 'User not found' });

    // Fetch messages between the logged-in user and the receiver
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: receiver._id },
        { sender: receiver._id, receiver: req.user._id },
      ],
    }).sort({ timestamp: 1 });

    // Enrich the messages with sender's email
    const enriched = await Promise.all(
      messages.map(async (msg) => {
        const senderUser = await User.findById(msg.sender);
        return {
          _id: msg._id,
          content: msg.content,
         timestamp: msg.timestamp,
          senderEmail: senderUser.email,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark message as read
router.put('/:messageId', protect, async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    message.read = true;
    await message.save();

    res.json({ message: 'Message marked as read', message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
