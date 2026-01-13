# 🏠 Bade Bhaiya: The Agentic Family Wrapper

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange.svg)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.1-purple.svg)](https://vitejs.dev/)

A robust, multi-agent AI voice assistant where each agent ("family member") specializes in a specific domain, powered by **Google Gemini Multimodal Live API** (WebSocket).

## 🌟 Overview

This application acts as a "Personified Operating System" for your life. Instead of dry menus, you talk to specialized personas:

| Agent | Persona | Specialty |
|-------|---------|-----------|
| 🧔 **Bade Bhaiya** | Wise Elder Brother | Routes you to the right specialist |
| 💼 **Rohan** | Tech-savvy Cousin | Builds your CV in real-time |
| 📊 **CA Sahab** | Strict Accountant | Tracks expenses & lectures you |
| ⏰ **Vikram** | Hyper Event Planner | Manages your schedule |

## 🚀 Key Features

- **Real-time Voice Conversation:** Low-latency 2-way audio using Gemini's WebSocket API
- **Agentic Tool Calling:** Agents trigger frontend state updates instantly
- **"Barge-In" Interruptibility:** Interrupt the agent anytime with 1.5s audio debouncing
- **Live Previews:** Visual workspaces update *while* the agent speaks

---

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** TailwindCSS
- **Build Tool:** Vite
- **AI/Voice:** Google Gemini 2.5 Flash (Native Audio)
- **Icons:** Lucide React

---

## 🧠 Architecture

### Tool Calling Flow
```
User Speech → Microphone → 16kHz PCM → WebSocket → Gemini
                                                      ↓
                                              Tool Call JSON
                                                      ↓
                              VoiceInterface.tsx ← handleFunctionCalls()
                                                      ↓
                                              App.tsx State Update
                                                      ↓
                                              Workspace Re-render
                                                      ↓
                              Gemini ← tool_response → Audio Confirmation
```

### Agent Switching
1. User requests specific help (Resume/Money/Schedule)
2. Current agent calls `connect_to_specialist` tool
3. WebSocket connection closes (Code 1000)
4. App.tsx updates `currentAgent` state
5. New WebSocket opens with new agent's system instruction
6. Context is preserved and passed to new agent

### Stability Engineering
- **Audio Debounce (1.5s):** Prevents "talking over" issues
- **Schema Flattening:** Prevents WebSocket crashes with complex objects
- **Silent Execution:** Agents call tools without narrating

---

## 🤖 Agent Tools

| Agent | Tools | Description |
|-------|-------|-------------|
| Bade Bhaiya | `connect_to_specialist` | Routes to sub-agents |
| Rohan | `generate_resume`, `update_resume_layout` | CV building |
| CA Sahab | `log_transaction` | Income/Expense tracking |
| Vikram | `add_task` | Schedule management |

---

## 💻 Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API Key ([Get one here](https://ai.google.dev/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Aadya-Madankar/Bade-Bhaiya.git
cd Bade-Bhaiya

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and add your API key
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Important:** Never commit your `.env` file. It's already in `.gitignore`.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🌍 Deployment (Vercel)

1. **Push to GitHub** (ensure `.env` is NOT committed)

2. **Import to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project" → Import from GitHub

3. **Add Environment Variable:**
   - Key: `VITE_GEMINI_API_KEY`
   - Value: Your actual API key

4. **Deploy!**

---

## 📁 Project Structure

```
bade-bhaiya-agent/
├── src/
│   ├── components/
│   │   ├── VoiceInterface.tsx    # Core WebSocket & Audio handler
│   │   ├── AgentDisplay.tsx      # Agent persona display
│   │   ├── Onboarding.tsx        # User onboarding flow
│   │   └── workspaces/
│   │       ├── ResumeWorkspace.tsx
│   │       ├── FinanceWorkspace.tsx
│   │       └── PlannerWorkspace.tsx
│   ├── constants.ts              # Agent configs & tool definitions
│   ├── App.tsx                   # Main app state management
│   └── types.ts                  # TypeScript interfaces
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
└── package.json
```

---

## 🔒 Security Notes

- `.env` is git-ignored - your API key is safe locally
- **Never hardcode API keys** in source files
- In production (Vercel), add keys via Environment Variables
- Client-side keys are visible in network traffic - use API quotas for protection

---

## 📄 Documentation

For detailed agent prompts and expected input/output scenarios, see:
- [SCENARIOS_AND_PROMPTS.md](./SCENARIOS_AND_PROMPTS.md)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aadya Madankar**
- GitHub: [@Aadya-Madankar](https://github.com/Aadya-Madankar)

---

## 🙏 Acknowledgments

- Google Gemini Team for the Multimodal Live API
- The React and Vite communities
