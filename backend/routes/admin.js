// routes/admin.js
const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth');

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin only)
 */
router.get('/dashboard', auth, isAdmin, async (req, res) => {
  try {
    // Example admin dashboard data
    const dashboardData = {
      totalUsers: 100, // Replace with actual DB query
      activeQuizzes: 25,
      completedAttempts: 500,
      systemStatus: 'healthy'
    };
    
    res.json(dashboardData);
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    // Replace with actual User model import and query
    // const users = await User.find().select('-password');
    
    // Placeholder response
    res.json([
      { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
      { id: 2, username: 'admin1', email: 'admin@example.com', role: 'admin' }
    ]);
  } catch (err) {
    console.error('Admin users query error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/admin/rooms
 * @desc    Get rooms status (moved from public endpoint)
 * @access  Private (Admin only)
 */
router.get('/rooms', auth, isAdmin, (req, res) => {
  // Access rooms data from the app context
  // This assumes you're passing the rooms object to the route
  const rooms = req.app.get('rooms');
  
  if (!rooms) {
    return res.status(500).json({ message: 'Rooms data not available' });
  }
  
  const roomStats = {};
  
  Object.keys(rooms).forEach(roomId => {
    roomStats[roomId] = {
      userCount: Object.keys(rooms[roomId].users).length,
      users: Object.values(rooms[roomId].users).map(u => u.username)
    };
  });
  
  res.json({
    activeRooms: Object.keys(rooms).length,
    rooms: roomStats
  });
});

module.exports = router;