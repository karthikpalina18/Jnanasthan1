// routes/notifications.js

const express = require('express');
const Notification = require('../models/Notification');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user._id); // Debug log
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error in GET /notifications:", err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:notificationId
// @access  Private
router.put('/:notificationId', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error("Error in PUT /notifications/:id:", err.message);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

module.exports = router;
