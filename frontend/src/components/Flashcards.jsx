import React, { useState, useEffect } from 'react';
import { Layers, AlertCircle, Sparkles, RefreshCw, CheckCircle, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';
import Loader from './Loader';

export default function Flashcards({ 
  prefilledTopic, 
  prefilledNotes, 
  clearPrefills, 
  addHistory, 
  incrementCardsStudied 
}) {
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [numCards, setNumCards] = useState(6);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cards state
  const [deck, setDeck] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [historyAnswers, setHistoryAnswers] = useState({}); // card index -> 'mastered' or 'practice'
  const [studyComplete, setStudyComplete] = useState(false);

  // Sync pre-fills from other components
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

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim() && !notes.trim()) return;

    setLoading(true);
    setError(null);
    setDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setHistoryAnswers({});
    setStudyComplete(false);

    try {
      const response = await fetch('http://localhost:5000/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim() ? topic : undefined,
          notes: notes.trim() ? notes : undefined,
          numCards
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred');
      }

      const data = await response.json();
      if (!data.flashcards || data.flashcards.length === 0) {
        throw new Error("No flashcards were generated. Please try again.");
      }
      
      setDeck(data.flashcards);
      addHistory('flashcards', topic.trim() ? `Deck: ${topic}` : 'Deck from Notes');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not contact the flashcards engine. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = (status) => {
    setHistoryAnswers({ ...historyAnswers, [currentIndex]: status });
    setIsFlipped(false);

    // Increment overall statistics in parent component when user finishes studying
    incrementCardsStudied();

    // Small delay to let card unflip before loading next card
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setStudyComplete(true);
      }
    }, 150);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }, 150);
  };

  const handleRestartStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setHistoryAnswers({});
    setStudyComplete(false);
  };

  const handleStartNew = () => {
    setDeck(null);
    setTopic('');
    setNotes('');
    setHistoryAnswers({});
    setStudyComplete(false);
  };

  const correctAnswersCount = Object.values(historyAnswers).filter(v => v === 'mastered').length;
  const progressPercent = deck ? ((currentIndex + (studyComplete ? 1 : 0)) / deck.length) * 100 : 0;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Flashcard Builder</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Utilize active recall to study core facts. Create flashcard decks from a simple topic keyword or copied text notes.</p>
      </div>

      {!deck && !loading ? (
        /* Setup State */
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Enter Topic Topic</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g., Photosynthesis, Newton's Laws, French Revolution..."
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
                  placeholder="Paste study material, definitions, or textbook articles to synthesize flashcards..."
                  value={notes === ' ' ? '' : notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Number of cards</label>
              <select
                className="glass-input glass-select"
                value={numCards}
                onChange={(e) => setNumCards(Number(e.target.value))}
              >
                <option value={4}>4 cards</option>
                <option value={6}>6 cards</option>
                <option value={8}>8 cards</option>
                <option value={10}>10 cards</option>
                <option value={12}>12 cards</option>
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
              Generate Flashcard Deck
            </button>
          </form>
        </div>
      ) : loading ? (
        /* Loading State */
        <div className="glass-panel" style={{ padding: '40px' }}>
          <Loader message={`Synthesizing ${numCards} active recall flashcards using AI...`} />
        </div>
      ) : studyComplete ? (
        /* Study Complete Summary */
        <div className="glass-panel" style={{ padding: '36px', maxWidth: '550px', margin: '0 auto', textAlign: 'center' }}>
          <div className="quiz-results-circle" style={{ borderColor: 'var(--warning)', color: 'var(--warning)' }}>
            {correctAnswersCount}/{deck.length}
          </div>
          <h3 style={{ fontSize: '1.6rem', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>Deck Review Finished! 🎉</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem' }}>
            You knew <strong>{correctAnswersCount}</strong> out of <strong>{deck.length}</strong> terms. Active recall training consolidates memory pathways. Keep testing yourself!
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={handleRestartStudy} style={{ gap: '8px' }}>
              <RefreshCw size={16} /> Review Again
            </button>
            <button className="btn btn-primary" onClick={handleStartNew} style={{ gap: '8px' }}>
              Create New Deck
            </button>
          </div>
        </div>
      ) : (
        /* Study State (Active Cards) */
        <div className="flashcard-view-wrapper">
          {/* Progress Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span>{Math.round(progressPercent)}% studied</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
          </div>

          {/* Flipped Card Container */}
          <div 
            className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
          >
            <div className="flashcard-inner">
              {/* Front Side */}
              <div className="flashcard-front">
                <span className="card-badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>Question</span>
                <h4>{deck[currentIndex]?.question}</h4>
                <span className="card-hint">Click card to reveal answer</span>
              </div>
              
              {/* Back Side */}
              <div className="flashcard-back">
                <span className="card-badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--secondary)' }}>Correct Answer</span>
                <p>{deck[currentIndex]?.answer}</p>
                <span className="card-hint">Click card to see question again</span>
              </div>
            </div>
          </div>

          {/* Controls row */}
          {isFlipped ? (
            /* Answer Evaluation Buttons */
            <div className="fade-in" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px' }}>
              <button 
                className="btn btn-secondary" 
                style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
                onClick={(e) => { e.stopPropagation(); handleAnswer('practice'); }}
              >
                Still Practicing
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'linear-gradient(135deg, var(--success), #34d399)', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}
                onClick={(e) => { e.stopPropagation(); handleAnswer('mastered'); }}
              >
                Got it Right!
              </button>
            </div>
          ) : (
            /* Basic Navigation Buttons */
            <div className="flashcard-controls" style={{ marginBottom: '24px' }}>
              <button 
                className="btn btn-secondary"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                style={{ padding: '10px 16px' }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <button 
                className="btn btn-secondary"
                style={{ gap: '6px' }}
                onClick={handleFlip}
              >
                Reveal Answer
              </button>

              <button 
                className="btn btn-secondary"
                onClick={handleNext}
                disabled={currentIndex === deck.length - 1}
                style={{ padding: '10px 16px' }}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleStartNew}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Exit Deck and Create New
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
