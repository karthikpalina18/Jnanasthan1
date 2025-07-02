const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },  // Use String instead of ObjectId
   receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: true }
});

module.exports = mongoose.model('Message', MessageSchema);
