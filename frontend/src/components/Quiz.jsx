import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, AlertCircle, Sparkles, Check, X, RefreshCw, Clock } from 'lucide-react';
import Loader from './Loader';
import { API_URL } from '../config';

export default function Quiz({ 
  prefilledTopic, 
  prefilledNotes, 
  clearPrefills, 
  addHistory, 
  incrementQuizStats 
}) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Quiz state
  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answersLog, setAnswersLog] = useState({}); // questionIndex -> selectedOptionText
  const [quizComplete, setQuizComplete] = useState(false);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);

  // Sync pre-fills
  useEffect(() => {
    if (prefilledTopic) {
      setTopic(prefilledTopic);
      setNotes('');
      clearPrefills();
    } else if (prefilledNotes) {
      setNotes(prefilledNotes);
      setTopic('');
      clearPrefills();
    }
  }, [prefilledTopic, prefilledNotes]);

  // Handle countdown timer
  useEffect(() => {
    if (questions && !quizComplete && !submitted) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit when time runs out
            handleTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [questions, currentIndex, submitted, quizComplete]);

  const handleTimeOut = () => {
    setSubmitted(true);
    setAnswersLog(prev => ({ ...prev, [currentIndex]: "No Answer (Time Out)" }));
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() && !notes.trim()) return;

    setLoading(true);
    setError(null);
    setQuestions(null);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setAnswersLog({});
    setQuizComplete(false);

    try {
      const response = await fetch(`${API_URL}/api/generate-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() ? topic : undefined,
          notes: notes.trim() ? notes : undefined,
          numQuestions
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred');
      }

      const data = await response.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions were returned from the engine.");
      }

      setQuestions(data.questions);
      addHistory('quiz', topic.trim() ? `Quiz: ${topic}` : 'Quiz from Notes');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not fetch quiz questions. Check that backend server is online.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || submitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSubmitted(true);
    setAnswersLog({ ...answersLog, [currentIndex]: selectedOption });
  };

  const handleNext = () => {
    setSelectedOption(null);
    setSubmitted(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Calculate scores and trigger dashboard updates
      const score = calculateScore();
      const pct = Math.round((score / questions.length) * 100);
      incrementQuizStats(pct);
      setQuizComplete(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (answersLog[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    return score;
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setSubmitted(false);
    setAnswersLog({});
    setQuizComplete(false);
  };

  const handleStartNew = () => {
    setQuestions(null);
    setTopic('');
    setNotes('');
    setAnswersLog({});
    setQuizComplete(false);
  };

  const currentQuestion = questions ? questions[currentIndex] : null;
  const progressPercent = questions ? ((currentIndex + (submitted ? 1 : 0)) / questions.length) * 100 : 0;
  const score = questions ? calculateScore() : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Interactive Quiz</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Validate your comprehension of the studied material with quick quizzes complete with detailed feedback.</p>
      </div>

      {!questions && !loading ? (
        /* Setup state */
        <div className="glass-panel" style={{ padding: '28px', maxWidth: '650px', margin: '0 auto' }}>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', gap: '16px' }}>
              <button
                type="button"
                className={`btn ${!notes ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => { setNotes(''); }}
              >
                Create by Topic
              </button>
              <button
                type="button"
                className={`btn ${notes || (!topic && !notes) ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                onClick={() => { setTopic(''); setNotes(' '); }}
              >
                Create from Custom Notes
              </button>
            </div>

            {notes === '' ? (
              /* Topic Input */
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Quiz Topic</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g., Cell Biology, Calculus Limits, World War I..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
            ) : (
              /* Notes Input */
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Paste Notes Content</label>
                <textarea
                  className="glass-input"
                  style={{ minHeight: '150px', resize: 'vertical' }}
                  placeholder="Paste study material, definitions, or textbook articles to synthesize custom quizzes..."
                  value={notes === ' ' ? '' : notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Number of Questions</label>
              <select
                className="glass-input glass-select"
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            {error && (
              <div className="alert-box">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={(!topic.trim() && !notes.trim())}
            >
              <Sparkles size={18} />
              Generate Study Quiz
            </button>
          </form>
        </div>
      ) : loading ? (
        /* Loading state */
        <div className="glass-panel" style={{ padding: '40px' }}>
          <Loader message={`Assembling ${numQuestions} custom questions and logical reviews...`} />
        </div>
      ) : quizComplete ? (
        /* Results View */
        <div className="glass-panel quiz-container" style={{ textAlign: 'center' }}>
          <div className="quiz-results-circle" style={{ 
            borderColor: score >= questions.length / 2 ? 'var(--success)' : 'var(--error)',
            color: score >= questions.length / 2 ? 'var(--success)' : 'var(--error)'
          }}>
            {score}/{questions.length}
          </div>
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Quiz Completed!</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            You scored <strong>{Math.round((score / questions.length) * 100)}%</strong>. Review the answer sheet details below.
          </p>

          {/* Answer Key Breakdown */}
          <div style={{ textAlign: 'left', marginBottom: '30px' }}>
            <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>Question Review</h4>
            {questions.map((q, idx) => {
              const userAns = answersLog[idx];
              const isCorrect = userAns === q.correctAnswer;
              return (
                <div key={idx} className="review-item">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '6px' }}>
                    {isCorrect ? (
                      <Check size={18} style={{ color: 'var(--success)', marginTop: '4px', flexShrink: 0 }} />
                    ) : (
                      <X size={18} style={{ color: 'var(--error)', marginTop: '4px', flexShrink: 0 }} />
                    )}
                    <h5 style={{ fontSize: '1rem', fontWeight: 600 }}>{idx + 1}. {q.question}</h5>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: '26px' }}>
                    <p style={{ margin: '2px 0' }}>Your Answer: <span style={{ color: isCorrect ? '#a7f3d0' : '#fca5a5', fontWeight: 600 }}>{userAns}</span></p>
                    {!isCorrect && (
                      <p style={{ margin: '2px 0' }}>Correct Answer: <span style={{ color: '#a7f3d0', fontWeight: 600 }}>{q.correctAnswer}</span></p>
                    )}
                    <p style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      💡 {q.explanation}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleRestartQuiz} style={{ gap: '8px' }}>
              <RefreshCw size={16} /> Retake Quiz
            </button>
            <button className="btn btn-primary" onClick={handleStartNew} style={{ gap: '8px' }}>
              Start New Topic
            </button>
          </div>
        </div>
      ) : (
        /* Quiz taking state */
        <div className="glass-panel quiz-container">
          <div className="quiz-header">
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Question {currentIndex + 1} of {questions.length}
            </span>
            {!submitted && (
              <div className="quiz-timer">
                <Clock size={16} />
                <span>{timeLeft}s left</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>

          {/* Question Box */}
          <div className="quiz-question-box">
            <h3>{currentQuestion?.question}</h3>
            
            <div className="quiz-options-list">
              {currentQuestion?.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrectAns = option === currentQuestion.correctAnswer;
                const wasSelectedWrong = isSelected && !isCorrectAns;

                let optionClass = 'quiz-option';
                if (submitted) {
                  if (isCorrectAns) optionClass += ' correct';
                  else if (wasSelectedWrong) optionClass += ' incorrect';
                } else if (isSelected) {
                  optionClass += ' selected';
                }

                return (
                  <button
                    key={idx}
                    className={optionClass}
                    onClick={() => handleOptionSelect(option)}
                    disabled={submitted}
                  >
                    <span>{option}</span>
                    {submitted && isCorrectAns && <Check size={18} style={{ color: 'var(--success)' }} />}
                    {submitted && wasSelectedWrong && <X size={18} style={{ color: 'var(--error)' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review explanations */}
          {submitted && (
            <div className="quiz-explanation fade-in">
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '4px' }}>AI Explanation:</strong>
              {currentQuestion?.explanation}
            </div>
          )}

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
            {!submitted ? (
              <button
                className="btn btn-primary"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
              >
                Submit Answer
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={handleNext}
              >
                {currentIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
