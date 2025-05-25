const mongoose = require('mongoose');

const StudyMaterialSchema = new mongoose.Schema({
  subject: String,
  units: [{
    unitNumber: Number,
    title: String,
    pdfUrl: String
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyMaterial', StudyMaterialSchema);
