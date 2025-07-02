const express = require('express');
const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Helper function to validate date strings
function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

// Get total count of quizzes (should be before dynamic routes)
router.get('/count', auth, async (req, res) => {
  try {
    const count = await Attempt.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error('Error in /count:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get attempts for logged-in user
router.get('/user', auth, async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user.id })
      .populate('quiz', 'title')
      .sort({ completedAt: -1 });

    res.json(attempts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start quiz attempt (no answers submitted yet)
router.post('/start', auth, async (req, res) => {
  try {
    const { quizId } = req.body;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const startTime = new Date();

    const attempt = new Attempt({
      user: req.user.id,
      quiz: quizId,
      startedAt: startTime,
      completedAt: null,
      timeSpent: 0,
      score: 0,
      maxPossibleScore: quiz.questions.reduce((acc, q) => acc + q.points, 0),
      answers: []
    });

    await attempt.save();

    res.status(201).json({
      message: 'Quiz attempt started successfully',
      attemptId: attempt._id,
      startedAt: startTime
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz attempt (create or update attempt)
router.post('/submit', auth, async (req, res) => {
  try {
    const { quizId, answers, attemptId, startedAt, completedAt } = req.body;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Invalid request data' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let attempt = null;

    if (attemptId) {
      attempt = await Attempt.findById(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: 'Attempt not found' });
      }
      if (attempt.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    // Calculate score and maxPossibleScore
    let score = 0;
    let maxPossibleScore = 0;

    const processedAnswers = answers.map(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (!question) return null;

      maxPossibleScore += question.points;

      let isCorrect = false;

      if (question.questionType === 'multiple-choice') {
        const correctOptions = question.options
          .filter(opt => opt.isCorrect)
          .map(opt => opt._id.toString());
        const selectedOptions = answer.selectedOptions || [];
        isCorrect =
          correctOptions.length === selectedOptions.length &&
          correctOptions.every(opt => selectedOptions.includes(opt));
      } else if (question.questionType === 'true-false') {
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = answer.selectedOptions &&
          answer.selectedOptions[0] === correctOption._id.toString();
      } else if (question.questionType === 'single-choice') {
        // For single choice, assuming answer.selectedOptionId contains selected option id
        const correctOption = question.options.find(opt => opt.isCorrect);
        isCorrect = answer.selectedOptionId === correctOption._id.toString();
      }

      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return {
        question: question._id,
        selectedOptions: answer.selectedOptions || (answer.selectedOptionId ? [answer.selectedOptionId] : []),
        isCorrect,
        pointsEarned
      };
    }).filter(Boolean);

    const validStartedAt = startedAt && isValidDate(startedAt) ? new Date(startedAt) : new Date();
    const validCompletedAt = completedAt && isValidDate(completedAt) ? new Date(completedAt) : new Date();

    const timeSpent = Math.floor((validCompletedAt - validStartedAt) / 1000);

    if (!attempt) {
      attempt = new Attempt({
        user: req.user.id,
        quiz: quizId,
        answers: processedAnswers,
        score,
        maxPossibleScore,
        startedAt: validStartedAt,
        completedAt: validCompletedAt,
        timeSpent
      });
    } else {
      attempt.answers = processedAnswers;
      attempt.score = score;
      attempt.completedAt = validCompletedAt;
      attempt.timeSpent = timeSpent;
    }

    await attempt.save();

    res.json({
      attemptId: attempt._id,
      score,
      maxPossibleScore,
      percentage: maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0,
      timeSpent
    });
  } catch (err) {
    console.error('Error submitting quiz attempt:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid data format', details: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get attempt details by id
router.get('/:id', auth, async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate('quiz');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(attempt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
