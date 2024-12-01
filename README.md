# THRIVE Toolkit

> Transform your experiences. Elevate your career. THRIVE.

THRIVE Toolkit is an AI-powered career development platform designed specifically for military spouses. We transform diverse life experiences into compelling professional narratives, helping you showcase your unique value to employers.

## ✨ Why THRIVE?

- **Turn Life Into Career Gold**: Our AI helps translate your unique military spouse experiences into powerful professional qualifications
- **Build Your Story**: Create polished experience cards that showcase your adaptability and skills
- **Smart Suggestions**: Get real-time recommendations to strengthen your professional narrative
- **Military Spouse Focused**: Designed specifically for the unique challenges and strengths of military spouse careers
- **Always Available**: Your career companion that moves with you, accessible anywhere, anytime

## 🎯 Perfect For

- Military spouses seeking career advancement
- Professionals managing frequent relocations
- Anyone translating life experiences into career assets
- Job seekers wanting to stand out with compelling stories
- Career changers needing to reframe their experience

## 🚀 Key Features

- **Smart Experience Builder**: AI-guided process to craft compelling professional narratives
- **STAR Format Integration**: Structure your experiences using the proven Situation, Task, Action, Result format
- **Dual Viewing Options**: Switch between bullet points for resumes or story cards for interviews
- **Real-time AI Assistance**: Get intelligent suggestions to strengthen your professional story
- **Live Sync**: Never lose your progress with automatic saving and syncing

## 🛠️ Technical Stack

- **Frontend**: Next.js 13+ with React
- **Styling**: Tailwind CSS with shadcn/ui components
- **Backend**: Python Flask API
- **AI Integration**: Integrated with Groq API for persona generation
- **State Management**: React Hooks with Local Storage
- **Additional Libraries**:
  - `emblor` for tag management
  - `recharts` for data visualization
  - `lucide-react` for icons
  - `axios` for API requests

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Python 3.8+
- Groq API key
- Ollama (for local LLM support)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/thrive-toolkit.git
cd thrive-toolkit
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000

# Backend (.env)
GROQ_API_KEY=your_groq_api_key
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=llama3
```

5. Start the development servers:
```bash
# Frontend
npm run dev

# Backend
python main.py
```

## 🏗️ Project Structure

```
thrive-toolkit/
├── components/           # React components
├── lib/                 # Utility functions and APIs
├── public/              # Static assets
├── styles/             # Global styles
├── types/              # TypeScript type definitions
├── backend/            # Python Flask backend
│   ├── agent.py       # AI agent implementation
│   └── main.py        # Flask server
└── pages/              # Next.js pages
```

## 🔑 Key Components

- **ExperienceCard**: Main component for displaying and editing experience cards
- **PersonaSelector**: Component for managing multiple personas
- **FormBuilder**: Dynamic form component for data collection
- **AI Agent**: Python-based AI integration for persona generation

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Georgia Tech Research Institute
- Military spouse community for valuable feedback and testing
- Open source community for the excellent tools and libraries

## 📧 Contact

For questions or support, please open an issue in the GitHub repository.

---

Built with pride by Georgia Tech Research Institute, supporting military spouse careers one story at a time. 🎖️
