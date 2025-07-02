const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  description: String,
  roadmap: String,
  industryBenefits: String,
  videos: [String], // array of video URLs
  notes: [String],  // array of note file URLs or content
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', CourseSchema);
