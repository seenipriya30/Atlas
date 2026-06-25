import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Layers, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'explain', label: 'Explain Topic', icon: BookOpen },
    { id: 'summarize', label: 'Summarizer', icon: FileText },
    { id: 'chat', label: 'AI Chat Tutor', icon: MessageSquare },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'AI Quiz', icon: HelpCircle },
  ];

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand">
        <GraduationCap size={28} style={{ stroke: 'url(#brand-grad)', color: 'var(--primary)' }} />
        <div>
          Study<span>Buddy</span>
        </div>
      </div>
      
      <div className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
