import React, { useState, useEffect, useRef } from 'react';
import { Send, GraduationCap, User, Sparkles, AlertCircle, Volume2, HelpCircle } from 'lucide-react';
import Loader from './Loader';
import { API_URL } from '../config';

// Audio Synthesizer for premium sound feedback
const playChatSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.error(e);
  }
};

export default function Chat({ addHistory }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Study Buddy tutor. 🎓 Ask me any academic question, paste a problem, or ask for a study checklist. What are we studying today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const chatEndRef = useRef(null);

  const presets = [
    "Explain Newton's third law of motion.",
    "Give me a quick JavaScript coding challenge.",
    "How can I memorize vocabulary words faster?"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');
    setError(null);
    setLoading(true);

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    playChatSound('send');

    // Add activity to history
    addHistory('chat', text.substring(0, 30) + (text.length > 30 ? '...' : ''));

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server error occurred');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      playChatSound('receive');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not communicate with the chat server. Check if backend is active.');
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text, index) => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        if (speakingIndex === index) {
          setSpeakingIndex(null);
          return;
        }
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeakingIndex(null);
      setSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Speech Synthesis is not supported in your browser.");
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', minHeight: '500px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>AI Interactive Tutor</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Chat dynamically with your study buddy, ask follow-up questions, or get customized quizzes.</p>
      </div>

      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '16px' }}>
        
        {/* Messages Body */}
        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.2s ease forwards'
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: isUser ? 'row-reverse' : 'row',
                  gap: '12px',
                  maxWidth: '80%'
                }}>
                  {/* Avatar Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isUser ? 'rgba(99, 102, 241, 0.15)' : 'rgba(168, 85, 247, 0.15)',
                    color: isUser ? 'var(--primary)' : 'var(--secondary)',
                    flexShrink: 0,
                    border: '1px solid var(--border-color)'
                  }}>
                    {isUser ? <User size={18} /> : <GraduationCap size={18} />}
                  </div>

                  {/* Speech Bubble */}
                  <div className="glass-panel" style={{
                    padding: '12px 16px',
                    borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                    backgroundColor: isUser ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor: isUser ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-color)',
                    position: 'relative'
                  }}>
                    <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.content}</p>
                    
                    {/* Read Aloud Button */}
                    {!isUser && (
                      <button
                        onClick={() => handleSpeak(msg.content, index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: speakingIndex === index ? 'var(--secondary)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          marginTop: '8px',
                          gap: '4px',
                          fontSize: '0.8rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: speakingIndex === index ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Volume2 size={14} className={speakingIndex === index ? 'float' : ''} />
                        {speakingIndex === index ? "Stop Reading" : "Read Aloud"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(168, 85, 247, 0.15)',
                color: 'var(--secondary)',
                border: '1px solid var(--border-color)'
              }}>
                <GraduationCap size={18} />
              </div>
              <div className="glass-panel" style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tutor is typing</span>
                <span style={{ display: 'inline-flex', gap: '3px' }}>
                  <span className="float" style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animationDelay: '0s' }}></span>
                  <span className="float" style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animationDelay: '0.2s' }}></span>
                  <span className="float" style={{ width: '4px', height: '4px', backgroundColor: 'var(--text-muted)', borderRadius: '50%', animationDelay: '0.4s' }}></span>
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert-box">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Preset prompts - show only at start of chat */}
        {messages.length === 1 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Suggested Questions:</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '20px' }}
                  onClick={() => handleSend(preset)}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Footer */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}
        >
          <input
            type="text"
            className="glass-input"
            placeholder="Ask your Study Buddy follow-up questions..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ borderRadius: '24px' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
            disabled={loading || !input.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
