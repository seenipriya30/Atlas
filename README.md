# AI-Powered Study Buddy 🎓

A premium, highly interactive educational platform designed to explain topics, summarize notes, generate quizzes, and build study flashcards with voice synthesis and real-time AI conversation tutor features.

## Project Structure

```
EDUNET/
├── backend/
│   ├── .env               # Groq API key configuration
│   ├── package.json
│   └── server.js          # Express server with Groq LLM routes
├── frontend/
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx        # Routing and state coordinator
│       ├── index.css      # Custom HSL & Glassmorphic variables
│       └── components/
│           ├── Dashboard.jsx
│           ├── Explainer.jsx
│           ├── Summarizer.jsx
│           ├── Chat.jsx    # Conversational AI Tutor
│           ├── Flashcards.jsx
│           ├── Quiz.jsx
│           └── Loader.jsx
└── README.md
```

## Features

- **Dashboard**: Central learning statistics (streak, completion scores, activity tracker) backed by local browser persistence.
- **AI Topic Explainer**: Adapts complex concepts to four custom educational levels: *ELI5*, *High School*, *University*, and *Expert Peer*.
- **Note Summarizer**: Paste notes or text inputs to instantly generate synthesized summaries, key takeaways, and definitions glossary boards.
- **Conversational Tutor**: Chat dynamically with an AI tutor, ask follow-up questions, and study via preset prompts.
- **Interactive Flashcards**: CSS 3D flipping card mechanics with recall difficulty markers (`Got it` vs `Need Practice`).
- **Interactive Quizzes**: Active countdown timers, MCQ/True-False inputs, instant correctness feedback, and grading summaries.
- **TTS Support**: Text-To-Speech audio synthesizer reads explanations aloud.
- **Audio Feedback**: Web Audio API generates synthetic bubble chimes for inputs.

---

## Local Setup & Run

### 1. Backend Server Setup
Navigate to the `backend/` directory, set up your keys, and run:
```bash
# Install node dependencies
npm install

# Setup env variables
cp .env.template .env # or edit .env directly
# Add your GROQ_API_KEY in the file

# Start server
npm start
```
*Runs on `http://localhost:5000`.*

### 2. Frontend Client Setup
Navigate to the `frontend/` directory and run:
```bash
# Install dependencies
npm install

# Start Vite server
npm run dev
```
*Runs on `http://localhost:5173`.*

---

## Deployment Guide

### Backend Deployment (Render, Heroku, or railway.app)
1. Push your repository to GitHub.
2. Link your repository to a service provider like **Render.com**.
3. Create a **Web Service**, set the Build Command to `npm install` and Start Command to `npm start` (with Root Directory set to `backend`).
4. Add the environment variable `GROQ_API_KEY` in the service configuration.

### Frontend Deployment (Vercel, Netlify, or GitHub Pages)
1. Create a project on **Vercel** or **Netlify**.
2. Link your repository.
3. Configure the Root Directory to `frontend`.
4. Build Command: `npm run build` and Output Directory: `dist`.
5. Update URLs in `frontend/src/` to point to your deployed backend URL instead of `localhost:5000`.
