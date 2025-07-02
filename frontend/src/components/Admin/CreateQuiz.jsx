
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 600, // Default: 10 minutes
    questions: [
      {
        questionText: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ],
        points: 1
      }
    ]
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, e) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index].questionText = e.target.value;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (questionIndex, optionIndex, e) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex].text = e.target.value;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handleCorrectOptionChange = (questionIndex, optionIndex) => {
    const updatedQuestions = [...formData.questions];
    // Reset all options to false first
    updatedQuestions[questionIndex].options.forEach((option, i) => {
      option.isCorrect = i === optionIndex;
    });
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const handlePointsChange = (questionIndex, e) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].points = parseInt(e.target.value, 10) || 1;
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          questionText: '',
          options: [
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ],
          points: 1
        }
      ]
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) {
      return; // Don't remove if it's the last question
    }
    const updatedQuestions = [...formData.questions];
    updatedQuestions.splice(index, 1);
    setFormData({
      ...formData,
      questions: updatedQuestions
    });
  };

  const validateQuiz = () => {
    // Basic validation
    if (!formData.title.trim()) return 'Quiz title is required';
    if (!formData.description.trim()) return 'Quiz description is required';
    
    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.questionText.trim()) return `Question ${i + 1} text is required`;
      
      let hasCorrectOption = false;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) return `Option ${j + 1} in question ${i + 1} is required`;
        if (q.options[j].isCorrect) hasCorrectOption = true;
      }
      
      if (!hasCorrectOption) return `Question ${i + 1} must have at least one correct option`;
    }
    
    return null; // No errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateQuiz();
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://jnanasthan-production.up.railway.app/quiz',
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          }
        }
      );
      
      navigate('/admin/quizzes');
    } catch (err) {
      setError('Failed to create quiz. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Quiz Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter quiz title"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter quiz description"
            rows="3"
            required
          ></textarea>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="timeLimit">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            id="timeLimit"
            name="timeLimit"
            value={formData.timeLimit}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            min="60"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {Math.floor(formData.timeLimit / 60)} minutes and {formData.timeLimit % 60} seconds
          </p>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Questions</h2>
        
        {formData.questions.map((question, qIndex) => (
          <div key={qIndex} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-medium">Question {qIndex + 1}</h3>
              <button
                type="button"
                onClick={() => removeQuestion(qIndex)}
                className="text-red-500 hover:text-red-700"
                disabled={formData.questions.length <= 1}
              >
                Remove
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Question Text
              </label>
              <input
                type="text"
                value={question.questionText}
                onChange={(e) => handleQuestionChange(qIndex, e)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter question"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Points
              </label>
              <input
                type="number"
                value={question.points}
                onChange={(e) => handlePointsChange(qIndex, e)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="1"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Options (select the correct one)
              </label>
              
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center mb-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={option.isCorrect}
                    onChange={() => handleCorrectOptionChange(qIndex, oIndex)}
                    className="mr-2"
                    required={oIndex === 0} // Make at least one option required
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(qIndex, oIndex, e)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder={`Option ${oIndex + 1}`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <button
          type="button"
          onClick={addQuestion}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-6"
        >
          Add Question
        </button>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/quizzes')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Create Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateQuiz;