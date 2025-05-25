const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timeLimit: {
    type: Number, // in minutes
    default: 30
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    points: {
      type: Number,
      default: 1
    },
    questionType: {
      type: String,
      enum: ['multiple-choice', 'true-false'],
      default: 'multiple-choice'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    trim: true,
    default: 'Uncategorized'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'difficult', 'moderate'],
    default: 'moderate'
  },
  attempts: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', QuizSchema);