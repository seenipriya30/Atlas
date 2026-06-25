import React, { useState } from 'react';
import { BookOpen, Award, CheckCircle, Sparkles, HelpCircle, Layers, AlertCircle } from 'lucide-react';
import Loader from './Loader';

export default function Explainer({ addHistory, triggerQuizCreation, triggerFlashcardCreation }) {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('High School');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const levels = [
    { name: 'ELI5 (5-year old)', value: 'ELI5', desc: 'Simple analogies and basic terms' },
    { name: 'High School', value: 'High School', desc: 'Practical intuition and concepts' },
    { name: 'University', value: 'University', desc: 'Theoretical depth and mechanisms' },
    { name: 'Expert Peer', value: 'Expert', desc: 'Academic details and math/logic' },
  ];

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred');
      }

      const data = await response.json();
      setResult(data);
      addHistory('explain', topic);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not contact the explanation engine. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Topic Explainer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Get tailor-made explanations for any complex scientific, mathematical, or humanities topic.</p>
      </div>

      <div className="explainer-container">
        {/* Control Sidebar */}
        <div className="glass-panel control-panel">
          <form onSubmit={handleExplain} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Topic to explain</label>
              <input
                type="text"
                className="glass-input"
                placeholder="e.g., Quantum Entanglement, Photosynthesis..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Explanation Depth</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {levels.map((lvl) => (
                  <label
                    key={lvl.value}
                    style={{
                      display: 'flex',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: level === lvl.value ? 'var(--primary)' : 'var(--border-color)',
                      background: level === lvl.value ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <input
                      type="radio"
                      name="level"
                      value={lvl.value}
                      checked={level === lvl.value}
                      onChange={() => setLevel(lvl.value)}
                      style={{ accentColor: 'var(--primary)' }}
                      disabled={loading}
                    />
                    <div>
                      <strong>{lvl.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lvl.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !topic.trim()}>
              <Sparkles size={18} />
              Explain Topic
            </button>
          </form>
        </div>

        {/* Output Panel */}
        <div className="glass-panel result-panel">
          {loading && <Loader message={`Teaching you ${topic} at a ${level} level...`} />}
          
          {error && (
            <div className="alert-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
              <BookOpen size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>Awaiting Topic Input</h3>
              <p style={{ maxWidth: '350px', fontSize: '0.9rem', marginTop: '4px' }}>Fill in the form on the left to get a structured explanation from the AI tutor.</p>
            </div>
          )}

          {result && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)' }}>{topic}</h3>
                  <span className="activity-tag explain" style={{ fontSize: '0.75rem', marginTop: '4px', display: 'inline-block' }}>{level} Explanation</span>
                </div>
              </div>

              {/* Overview */}
              <div className="overview-box">
                <div className="section-title">
                  <BookOpen size={16} /> Overview
                </div>
                <p>{result.overview}</p>
              </div>

              {/* Analogy */}
              {result.analogy && (
                <div className="analogy-box">
                  <div style={{ fontWeight: 700, color: 'var(--secondary)', marginBottom: '6px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    💡 Explanatory Analogy
                  </div>
                  "{result.analogy}"
                </div>
              )}

              {/* Key Concepts */}
              {result.keyConcepts && result.keyConcepts.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="section-title">
                    <Award size={16} /> Core Concepts to Remember
                  </div>
                  <div className="concepts-list">
                    {result.keyConcepts.map((concept, index) => (
                      <div key={index} className="concept-item">
                        <h5>{concept.title}</h5>
                        <p>{concept.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real World Application */}
              {result.application && (
                <div className="app-box">
                  <div style={{ fontWeight: 700, color: 'var(--accent)', marginBottom: '6px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    🌍 Real-World Application
                  </div>
                  {result.application}
                </div>
              )}

              {/* Cohesive Action Row */}
              <div className="action-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: '8px' }}
                  onClick={() => triggerQuizCreation(topic, null)}
                >
                  <HelpCircle size={16} />
                  Test with a Quiz
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ gap: '8px' }}
                  onClick={() => triggerFlashcardCreation(topic, null)}
                >
                  <Layers size={16} />
                  Study as Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
