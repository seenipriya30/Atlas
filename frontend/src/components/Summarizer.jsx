import React, { useState } from 'react';
import { FileText, AlertCircle, Sparkles, Check, HelpCircle, Layers, List } from 'lucide-react';
import Loader from './Loader';

export default function Summarizer({ addHistory, triggerQuizCreation, triggerFlashcardCreation }) {
  const [notes, setNotes] = useState('');
  const [length, setLength] = useState('medium');
  const [includeGlossary, setIncludeGlossary] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const charLimit = 15000;

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, length, includeGlossary }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred');
      }

      const data = await response.json();
      setResult(data);
      addHistory('summarize', notes.substring(0, 30) + (notes.length > 30 ? '...' : ''));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not contact the summary engine. Please verify the server is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Note Summarizer</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Paste raw lecture notes, textbook chapters, or articles to extract digestible key insights.</p>
      </div>

      <div className="summarizer-container">
        {/* Input area */}
        <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
          <form onSubmit={handleSummarize} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                Paste your notes here ({notes.length} / {charLimit} chars)
              </label>
              <div className="textarea-wrapper">
                <textarea
                  className="glass-input"
                  style={{ minHeight: '250px', resize: 'vertical', lineHeight: '1.5' }}
                  placeholder="Paste your textbooks, notes, transcription, or copy-paste reference material..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, charLimit))}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Summary Length</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['short', 'medium', 'detailed'].map((len) => (
                    <button
                      key={len}
                      type="button"
                      className={`btn btn-secondary ${length === len ? 'active' : ''}`}
                      style={{ padding: '8px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}
                      onClick={() => setLength(len)}
                      disabled={loading}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={includeGlossary}
                    onChange={(e) => setIncludeGlossary(e.target.checked)}
                    style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    disabled={loading}
                  />
                  Generate Glossary Table
                </label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !notes.trim()}>
              <Sparkles size={18} />
              Summarize Content
            </button>
          </form>
        </div>

        {/* Results display */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
          {loading && <Loader message="Analyzing text and drafting summary..." />}

          {error && (
            <div className="alert-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && !result && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', padding: '60px 0' }}>
              <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>Awaiting Notes Content</h3>
              <p style={{ maxWidth: '350px', fontSize: '0.9rem', marginTop: '4px' }}>Submit notes on the left. The AI will extract bullet points, definitions, and synthesize a summary.</p>
            </div>
          )}

          {result && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)' }}>Study Summary</h3>
                <span className="activity-tag summarize">{length} guide</span>
              </div>

              {/* Summary Paragraph */}
              <div style={{ marginBottom: '24px' }}>
                <div className="section-title">
                  <FileText size={16} /> Summary Synthesis
                </div>
                <p style={{ color: 'var(--text-primary)', lineHeight: '1.7', fontSize: '1rem' }}>{result.summary}</p>
              </div>

              {/* Key Takeaways */}
              {result.takeaways && result.takeaways.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="section-title">
                    <List size={16} /> Key Takeaways
                  </div>
                  <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.takeaways.map((item, index) => (
                      <li key={index} style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Glossary Terms */}
              {includeGlossary && result.glossary && result.glossary.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <div className="section-title">
                    <Check size={16} /> Key Glossary Terms
                  </div>
                  <div className="glossary-grid">
                    {result.glossary.map((item, index) => (
                      <div key={index} className="glossary-card">
                        <strong>{item.term}</strong>
                        <span>{item.definition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action row to pass the summary notes direct to flashcards or quizzes */}
              <div className="action-row" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button
                  className="btn btn-secondary"
                  style={{ gap: '8px' }}
                  onClick={() => triggerQuizCreation(null, notes)}
                >
                  <HelpCircle size={16} />
                  Convert to Quiz
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ gap: '8px' }}
                  onClick={() => triggerFlashcardCreation(null, notes)}
                >
                  <Layers size={16} />
                  Convert to Flashcards
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
