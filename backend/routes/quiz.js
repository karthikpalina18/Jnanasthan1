const express = require('express');
const Quiz = require('../models/Quiz');
const { auth, isAdmin } = require('../middleware/auth');

const router = express.Router();
const authMiddleware=require('../middleware/authMiddleware');

// Create quiz (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, timeLimit, questions } = req.body;
    
    const newQuiz = new Quiz({
      title,
      description,
      timeLimit,
      questions,
      createdBy: req.user.id
    });
    
    const quiz = await newQuiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/count', auth,async (req, res) => {
  try {
    const count = await Quiz.countDocuments(); // or whatever your model is
    res.status(200).json({ count });
  } catch (err) {
    console.error('Error in /quiz/count:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/recent', auth, async (req, res) => {
  const recentQuizzes = await Quiz.find().sort({ createdAt: -1 }).limit(5);
  res.json(recentQuizzes);
});
// Get all published quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isPublished: true })
      .select('title description timeLimit createdAt questions')
      .sort({ createdAt: -1 })
      .lean();  // convert Mongoose docs to plain JS objects

    // Map to add questionsCount property
    const quizzesWithCount = quizzes.map(q => ({
      _id: q._id,
      title: q.title,
      description: q.description,
      timeLimit: q.timeLimit,
      createdAt: q.createdAt,
      questionsCount: Array.isArray(q.questions) ? q.questions.length : 0,
    }));

    res.json(quizzesWithCount);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get quiz by ID (for taking the quiz)
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    // Remove correct answers for security when sending to users
    const safeQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      questions: quiz.questions.map(q => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options.map(o => ({
          _id: o._id,
          text: o.text
        })),
        questionType: q.questionType
      }))
    };
    
    res.json(safeQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes for quiz management
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const { title, description, timeLimit, questions, isPublished } = req.body;
    
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.timeLimit = timeLimit || quiz.timeLimit;
    quiz.questions = questions || quiz.questions;
    quiz.isPublished = isPublished !== undefined ? isPublished : quiz.isPublished;
    
    const updatedQuiz = await quiz.save();
    res.json(updatedQuiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    await quiz.remove();
    res.json({ message: 'Quiz removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;