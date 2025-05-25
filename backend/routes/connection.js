
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware'); // the one you shared
const ConnectionRequest = require('../models/Connection');
const User = require('../models/User');
const Notification = require('../models/Notification');  // Add the Notification model

// Create a notification
const createNotification = async (userId, message, type) => {
  const notification = new Notification({
    user: userId,
    message,
    type
  });

  await notification.save();
};

router.post('/send', protect, async (req, res) => {
  try {
    const { email } = req.body;

    // Step 1: Check if recipient exists
    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    // Step 2: Check if sender is not trying to send request to themselves
    if (recipient._id.equals(req.user._id)) {
      return res.status(400).json({ message: 'Cannot send request to yourself' });
    }

    // Step 3: Create a connection request
    const request = await ConnectionRequest.create({
      sender: req.user._id,
      receiver: recipient._id,
      status: 'pending'
    });

    // Step 4: Create a notification for the recipient
    const message = `${req.user.username} has sent you a connection request.`;
    await createNotification(recipient._id, message, 'connection-request');

    return res.status(200).json({ message: 'Request sent', request });
  } catch (error) {
    console.error('💥 Error in /api/connection/send:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Accept a connection request
// connections.js

// Accept a connection request
router.put('/:connectionId/accept', protect, async (req, res) => {
  try {
    const connection = await ConnectionRequest.findById(req.params.connectionId);
    if (!connection) {
      return res.status(404).json({ error: 'Connection request not found' });
    }

    // Ensure the receiver is the logged-in user
    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Change the status to 'accepted'
    connection.status = 'accepted';
    await connection.save();

    // Create a notification for the sender
    const message = `Your connection request to ${connection.receiver.username} has been accepted.`;
    await createNotification(connection.sender, message, 'connection-accepted');

    res.json({ message: 'Connection request accepted', connection });
  } catch (err) {
    console.error('Error accepting connection request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Reject a connection request
router.put('/:connectionId/reject', protect, async (req, res) => {
  try {
    const connection = await ConnectionRequest.findById(req.params.connectionId);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    if (connection.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    connection.status = 'rejected';
    await connection.save();

    res.json({ message: 'Connection rejected', connection });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all connections for a user
// connections.js

// Get all connections for the logged-in user
router.get('/myConnections', protect, async (req, res) => {
  try {
    const connections = await ConnectionRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted'
    }).populate('sender receiver', 'username email');

    res.json(connections);
  } catch (err) {
    console.error('Error fetching connections:', err);
    res.status(500).json({ error: err.message });
  }
});
// Get pending connection requests
// routes/connections.js
router.get('/pendingRequests', protect, async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'username email');

    res.json(requests);
  } catch (err) {
    console.error('❌ Error in /pendingRequests route:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




module.exports = router;
