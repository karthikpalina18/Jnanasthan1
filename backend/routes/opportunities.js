const express = require('express');
const Opportunity = require('../models/Opportunity'); // Remove the .js extension

const router = express.Router();

// POST: Upload opportunity
router.post('/upload', async (req, res) => {
  try {
    const newOpportunity = new Opportunity(req.body);
    await newOpportunity.save();
    res.status(201).json({ message: 'Opportunity posted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Fetch all opportunities
// GET: Fetch and clean opportunities
router.get('/', async (req, res) => {
  try {
    const today = new Date();

    // Delete expired opportunities
    await Opportunity.deleteMany({ deadline: { $lt: today } });

    // Fetch upcoming/current ones only
    const opportunities = await Opportunity.find({ deadline: { $gte: today } })
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
