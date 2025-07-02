// Fetch all courses
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

// Add a new course (Admin only)
router.post('/add', async (req, res) => {
  try {
    const course = new Course(req.body);  // Create new course using request body
    await course.save();
    res.status(201).json({ message: 'Course added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



router.get('/', async (req, res) => {
  const courses = await Course.find({});
  res.json(courses);
});

router.post('/:id/enroll', async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const course = await Course.findById(req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  if (!course.enrolledUsers.includes(userId)) {
    course.enrolledUsers.push(userId);
    await course.save();
    res.json({ message: 'Enrolled successfully!' });
  } else {
    res.status(400).json({ message: 'User already enrolled' });
  }
});

// Fetch single course
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
