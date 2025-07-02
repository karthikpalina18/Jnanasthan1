import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './QuizList.css'; // Create this for styling

const QuizList = () => {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    axios.get('https://jnanasthan-production.up.railway.app/quiz')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        setQuizzes(data);
        console.log('Quiz:', data);
      })
      .catch((error) => {
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      });
  }, []);

  return (
    <div className="quiz-list-container">
      <h2 className="quiz-list-title">📘 Available Quizzes</h2>

      {quizzes.length > 0 ? (
        <div className="quiz-cards">
          {quizzes.map((quiz) => (
            <Link to={`/quiz/${quiz._id}`} className="quiz-card" key={quiz._id}>
              <div className="quiz-content">
                <h3 className="quiz-title">{quiz.title}</h3>
                <p className="quiz-desc">{quiz.description}</p>
                <div className="quiz-details">
                  <span>🧠 {quiz.questionsCount} Questions</span>

                  <span>⏱️ {quiz.timeLimit} sec</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="no-quizzes">No quizzes available.</p>
      )}
    </div>
  );
};

export default QuizList;
