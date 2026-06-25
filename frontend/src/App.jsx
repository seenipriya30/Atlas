import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Explainer from './components/Explainer';
import Summarizer from './components/Summarizer';
import Chat from './components/Chat';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Prefill states for navigation between tools
  const [prefilledTopic, setPrefilledTopic] = useState('');
  const [prefilledNotes, setPrefilledNotes] = useState('');

  // Persistent Stats & History
  const [stats, setStats] = useState({
    topicsExplained: 0,
    notesSummarized: 0,
    flashcardsStudied: 0,
    quizzesTaken: 0,
    quizScoreSum: 0
  });

  const [history, setHistory] = useState([]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('study_buddy_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (e) {
        console.error("Error loading stats", e);
      }
    }

    const savedHistory = localStorage.getItem('study_buddy_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Error loading history", e);
      }
    }
  }, []);

  // Save changes helper
  const saveStats = (newStats) => {
    setStats(newStats);
    localStorage.setItem('study_buddy_stats', JSON.stringify(newStats));
  };

  const addHistory = (type, title) => {
    const newHistoryItem = {
      type,
      title,
      timestamp: new Date().toISOString()
    };
    const updatedHistory = [newHistoryItem, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('study_buddy_history', JSON.stringify(updatedHistory));

    // Also auto-increment respective counters
    const newStats = { ...stats };
    if (type === 'explain') newStats.topicsExplained += 1;
    if (type === 'summarize') newStats.notesSummarized += 1;
    saveStats(newStats);
  };

  const incrementCardsStudied = () => {
    const newStats = { ...stats, flashcardsStudied: stats.flashcardsStudied + 1 };
    saveStats(newStats);
  };

  const incrementQuizStats = (scorePercent) => {
    const newStats = { 
      ...stats, 
      quizzesTaken: stats.quizzesTaken + 1,
      quizScoreSum: stats.quizScoreSum + scorePercent
    };
    saveStats(newStats);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('study_buddy_history');
  };

  // Switch tabs & prefill topics/notes
  const triggerQuizCreation = (topic, notes) => {
    if (topic) setPrefilledTopic(topic);
    if (notes) setPrefilledNotes(notes);
    setActiveTab('quiz');
  };

  const triggerFlashcardCreation = (topic, notes) => {
    if (topic) setPrefilledTopic(topic);
    if (notes) setPrefilledNotes(notes);
    setActiveTab('flashcards');
  };

  const clearPrefills = () => {
    setPrefilledTopic('');
    setPrefilledNotes('');
  };

  // Render current tab component
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            history={history} 
            setActiveTab={setActiveTab} 
            clearHistory={clearHistory}
          />
        );
      case 'explain':
        return (
          <Explainer 
            addHistory={addHistory}
            triggerQuizCreation={triggerQuizCreation}
            triggerFlashcardCreation={triggerFlashcardCreation}
          />
        );
      case 'summarize':
        return (
          <Summarizer 
            addHistory={addHistory}
            triggerQuizCreation={triggerQuizCreation}
            triggerFlashcardCreation={triggerFlashcardCreation}
          />
        );
      case 'chat':
        return (
          <Chat 
            addHistory={addHistory}
          />
        );
      case 'flashcards':
        return (
          <Flashcards 
            prefilledTopic={prefilledTopic}
            prefilledNotes={prefilledNotes}
            clearPrefills={clearPrefills}
            addHistory={addHistory}
            incrementCardsStudied={incrementCardsStudied}
          />
        );
      case 'quiz':
        return (
          <Quiz 
            prefilledTopic={prefilledTopic}
            prefilledNotes={prefilledNotes}
            clearPrefills={clearPrefills}
            addHistory={addHistory}
            incrementQuizStats={incrementQuizStats}
          />
        );
      default:
        return <Dashboard stats={stats} history={history} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-container">
      {/* Brand logo gradient definition for Lucide Cap icon */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="100%" stopColor="var(--secondary)" />
        </linearGradient>
      </svg>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  );
}
