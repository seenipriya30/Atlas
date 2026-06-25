import React from 'react';
import { 
  BookOpen, 
  FileText, 
  Layers, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  ArrowRight 
} from 'lucide-react';

export default function Dashboard({ stats, history, setActiveTab, clearHistory }) {
  const tools = [
    {
      id: 'explain',
      title: 'Topic Explainer',
      description: 'Break down complex topics into easy-to-understand explanations with custom depth levels.',
      icon: BookOpen,
      color: 'var(--primary)',
      bgColor: 'rgba(99, 102, 241, 0.1)'
    },
    {
      id: 'summarize',
      title: 'Note Summarizer',
      description: 'Upload or paste notes to generate compact summaries, bullet points, and glossaries.',
      icon: FileText,
      color: 'var(--secondary)',
      bgColor: 'rgba(168, 85, 247, 0.1)'
    },
    {
      id: 'flashcards',
      title: 'Flashcard Builder',
      description: 'Generate active recall cards on demand or convert your summarized notes into decks.',
      icon: Layers,
      color: 'var(--warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      id: 'quiz',
      title: 'Interactive Quizzes',
      description: 'Test your understanding with instant grading and comprehensive AI explanations.',
      icon: HelpCircle,
      color: 'var(--accent)',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    }
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>Welcome Back, Scholar! 👋</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
            What are we learning today? Use our AI-powered learning tools to explain difficult concepts, compile summary guides, review flashcards, or test your skills.
          </p>
        </div>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          borderRadius: '50%'
        }}></div>
      </div>

      {/* Stats Section */}
      <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Your Study Statistics</h3>
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.topicsExplained || 0}</h3>
            <p>Topics Explained</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.notesSummarized || 0}</h3>
            <p>Notes Summarized</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
            <Layers size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.flashcardsStudied || 0}</h3>
            <p>Cards Reviewed</p>
          </div>
        </div>

        <div className="glass-panel stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.quizzesTaken > 0 ? `${Math.round(stats.quizScoreSum / stats.quizzesTaken)}%` : '0%'}</h3>
            <p>Quiz Average</p>
          </div>
        </div>
      </div>

      {/* Study Tools Grid */}
      <h3 style={{ marginBottom: '16px', fontFamily: 'var(--font-display)' }}>Study Tools</h3>
      <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div 
              key={tool.id} 
              className="glass-panel tool-card"
              onClick={() => setActiveTab(tool.id)}
            >
              <div className="tool-icon-wrapper" style={{ backgroundColor: tool.bgColor, color: tool.color }}>
                <Icon size={28} />
              </div>
              <h4>{tool.title}</h4>
              <p>{tool.description}</p>
              <div style={{ marginTop: '16px', color: tool.color, display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, fontSize: '0.9rem' }}>
                Open Tool <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} style={{ color: 'var(--primary)' }} />
              Recent Activity Log
            </h3>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear Log
              </button>
            )}
          </div>
          
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              No recent activity yet. Select a tool above to begin studying!
            </div>
          ) : (
            <div className="activity-list">
              {history.slice(0, 5).map((item, index) => (
                <div key={index} className="activity-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`activity-tag ${item.type}`}>
                      {item.type}
                    </span>
                    <strong style={{ fontWeight: 500 }}>{item.title}</strong>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
