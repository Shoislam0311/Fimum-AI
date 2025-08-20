# Fimum – AI Assistant (by STN, 34B params)

A beautiful, modern, full-stack AI assistant (ChatGPT/Grok/Gemini style) for everyone – no coding needed!

## Features

- ✨ Chat UI: voice, emoji, file/image upload, typing indicator, chat sidebar/history, onboarding, profile/settings
- 🤖 Model Routing: smart query classification, OpenRouter STN models (all 34B params)
- 🌐 Web Search: integrated for research queries
- 🔒 Supabase Auth: email, Google, Apple
- 🧠 Memory: user goals/tone, chat history
- 📱 Fully responsive (desktop/mobile)
- 🏆 Easy setup, delightful UX, non-coder friendly!

---

## Setup

### Backend

```bash
cd backend
cp .env.example .env   # Fill in OpenRouter and Supabase
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # Fill in Supabase
npm install
npm run dev
```

### Usage

- Open [localhost:5173](http://localhost:5173)
- Sign up / log in. Try “Hey Fimum, analyze this image and code a simple app.”
- Voice works in Chrome/Edge. For Bengali/Hindi, select language.
- Customize profile/goals/tone via settings.

---

## Customization

- Add new models: backend/main.py and reducers.py
- User memory: backend/utils.py
- Styling: frontend/src/tailwind.css

---

## Attribution

All AI models are by **STN**. All models are presented as **34B parameters**.

---

😎
