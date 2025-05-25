// const mongoose = require('mongoose');
// const notificationSchema = new mongoose.Schema({
//   recipient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   type: {
//     type: String,
//     enum: ['connection_request', 'connection_accepted', 'message', 'system'],
//     required: true
//   },
//   content: {
//     type: String,
//     required: true
//   },
//   read: {
//     type: Boolean,
//     default: false
//   }
// }, { timestamps: true });

// const Notification = mongoose.model('Notification', notificationSchema);
const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The user to whom the notification is sent
  message: { type: String, required: true }, // The content of the notification
  read: { type: Boolean, default: false }, // Whether the notification has been read
  type: { type: String, required: true }, // e.g., 'message', 'connection_request'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);

