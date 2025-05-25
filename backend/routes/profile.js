const express = require('express');
const Profile = require('../models/Profile');
const User = require('../models/User');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Create a profile for a user (when user first registers)
router.post('/', protect, async (req, res) => {
  const { bio, linkedin, github, leetcode, website, profilePicture, location } = req.body;
  
  try {
    const profile = new Profile({
      user: req.user._id, // associate with the logged-in user
      bio,
      linkedin,
      github,
      leetcode,
      website,
      profilePicture,
      location
    });
    console.log(req.user);

    await profile.save();
    res.json({ message: 'Profile created successfully', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile by user ID
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId }).populate('user', 'username email');
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
router.put('/', protect, async (req, res) => {
  const { bio, linkedin, github, leetcode, website, profilePicture, location } = req.body;
  
  try {
    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { bio, linkedin, github, leetcode, website, profilePicture, location },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
