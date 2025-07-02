const express = require('express');
const router = express.Router();
const StudyMaterial = require('../models/StudyMaterial');



// Add study material for a subject (Admin only)
router.post('/add', async (req, res) => {
  try {
    const material = new StudyMaterial(req.body);
    await material.save();
    res.status(201).json({ message: 'Study material added successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all study materials
router.get('/', async (req, res) => {
  const materials = await StudyMaterial.find();
  res.json(materials);
});

// Search study materials by subject (used by search bar)
router.get('/subject/:name', async (req, res) => {
  const { name } = req.params;
  const result = await StudyMaterial.findOne({ subject: name });
  if (result) {
    res.json(result);
  } else {
    res.status(404).json({ message: 'Subject not found' });
  }
});


// Fetch all subject names
router.get('/subjects', async (req, res) => {
  const subjects = await StudyMaterial.find({}).select('subject -_id');
  res.json(subjects.map(s => s.subject));
});

// Fetch unit-wise material
router.get('/:subject', async (req, res) => {
  const material = await StudyMaterial.findOne({ subject: req.params.subject });
  res.json(material);
});

module.exports = router;
