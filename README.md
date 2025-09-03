# Fimum AI - Personal AI Assistant

Fimum is a powerful personal AI assistant like ChatGPT, Grok, or Gemini, designed for users with no coding skills. It provides a browser-based chat interface where users can interact via text or voice, and the AI handles autonomous internet tasks, remembers user data, analyzes files/images, and routes queries to specific AI models.

## Features

- **Multi-model AI Routing**: Automatically routes queries to the most appropriate AI model
- **Voice Interaction**: Supports voice input/output in Bengali, English, and Hindi
- **File Analysis**: Upload and analyze images and documents
- **Web Search**: Performs web research for complex queries
- **Personalization**: Remembers user preferences and goals
- **Responsive Design**: Works on all device sizes
- **Conversation History**: Save and manage chat histories
- **Dark/Light Mode**: Toggle between themes

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- React Icons for UI icons

### Backend
- Python FastAPI
- PostgreSQL via Supabase
- OpenRouter API for AI models
- Search engines library for web research

## AI Models

All models are created by STN-AI with 34B parameters:

1. **Fimum Basic** (`openai/gpt-oss-20b:free`) - General conversation
2. **Fimum Thinker** (`nvidia/llama-3.1-nemotron-ultra-253b-v1:free`) - Deep reasoning
3. **Fimum Coder** (Multi-model) - Coding assistance
   - `qwen/qwen3-coder:free`
   - `agentica-org/deepcoder-14b-preview:free`
   - `qwen/qwen-2.5-coder-32b-instruct:free`
4. **Fimum Uncensored** (`cognitivecomputations/dolphin-mistral-24b-venice-edition:free`) - Raw responses
5. **Fimum DeepThink** (Multi-model) - Deep analysis
   - `moonshotai/kimi-vl-a3b-thinking:free`
   - `deepseek/deepseek-chat-v3-0324:free`
6. **Fimum Vision** (Multi-model) - Image analysis
   - `mistralai/mistral-small-3.2-24b-instruct:free`
   - `moonshotai/kimi-vl-a3b-thinking:free`
   - `meta-llama/llama-3.2-11b-vision-instruct:free`

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your configuration:
   ```env
   OPENROUTER_API_KEY=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
   SUPABASE_URL=postgresql://postgres:Alexander#B:03@db.zlzzazqkpzabqogwsuij.supabase.co:5432/postgres
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsenphenFrcHphYnFvZ3dzdWlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4OTU4NTMsImV4cCI6MjA3MjQ3MTg1M30.jiPP1675pH_2J3_QP5iwN-6U-LJ1dhvGD0iJysdxutU
   ```

5. Run the backend:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`
