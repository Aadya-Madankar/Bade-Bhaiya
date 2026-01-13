# Bade Bhaiya: The Agentic Family Wrapper

A robust, multi-agent AI workspace where each agent ("family member") specializes in a specific domain, powered by **Google Gemini Multimodal Live API** (WebSocket).

![Bade Bhaiya Interface](https://via.placeholder.com/800x400?text=Bade+Bhaiya+Agent+Interface)

## 🌟 Overview

This application acts as a "Personified Operating System" for your life. Instead of dry menus, you talk to specialized personas:
*   **Bade Bhaiya (Master Agent):** The wise orchestrator who routes you to the right specialist.
*   **Rohan (Resume Agent):** A tech-savvy cousin who builds your CV in real-time.
*   **CA Sahab (Finance Agent):** A strict, judgmental accountant who tracks your expenses.
*   **Vikram (Day Planner):** An urgent, hyper-active event planner for your schedule.

## 🚀 Key Features

*   **Real-time Voice Conversation:** Low-latency 2-way audio using Gemini's WebSocket API.
*   **Agentic Tool Calling:** Agents don't just talk; they *do*. They trigger frontend state updates (Resume Layouts, Transaction Logs, Task Lists) instantly.
*   **"Barge-In" Interruptibility:** Interrupt the agent anytime. The system uses advanced client-side audio debouncing (1.5s) to stop the AI instantly and prevent overlapping audio.
*   **Live Previews:** Visual workspaces that update *while* the agent speaks (Resume Preview, Ledger, Calendar).

---

## 🛠️ Architecture & Tool Calling Flow

The core of this app is `VoiceInterface.tsx`. Here is exactly how the "Magic" happens:

### 1. The Speech Loop
1.  **Microphone Input:** Browser Audio -> Downsampled to 16kHz PCM -> Base64 -> WebSocket.
2.  **Gemini Backend:** Processes audio + System Prompt + Conversation History.
3.  **Response:** Gemini sends back audio chunks (playback) OR functioning calling JSON.

### 2. The Tool Calling Mechanism
When you say *"Add a task for 5 PM"*:
1.  **Intent Recognition:** Gemini pauses audio generation.
2.  **Server Message:** Sends `tool_use` event with function name (`add_task`) and arguments (`{ task: "Gym", time: "5 PM" }`).
3.  **Frontend Execution:** `VoiceInterface.tsx` intercepts this event.
    *   It executes the logic (e.g., `App.tsx` -> `setTasks(...)`).
    *   It sends a `tool_response` back to Gemini confirming success ("Task added").
4.  **Visual Update:** The React component (`PlannerWorkspace`) re-renders instantly.
5.  **Verbal Confirmation:** Gemini resumes speaking: *"Done! I've added Gym to your list."*

### 3. Stability Measures (Why it works smoothly)
*   **Silent Execution Prompts:** Agents are instructed to call tools *without* narrating steps to prevent hallucinations.
*   **1.5s Audio Debounce:** If you speak, the AI's audio queue is nuked and blocked for 1.5 seconds to ensure clean turn-taking.
*   **Robust Type Handling:** The system auto-corrects messy model inputs (e.g., parsing "500 rupees" into `500`).

---

## 🤖 Agent Roster & Tools

### 1. Bade Bhaiya (Master)
*   **Role:** Router / Wise Counsel.
*   **Tool:** `connect_to_specialist`
*   **Trigger:** "I need help with [Resume/Money/Time]." -> Transfers context to the sub-agent.

### 2. Rohan (Resume Builder)
*   **Role:** Iterative CV Builder.
*   **Tool 1:** `generate_resume` (Updates Name, Education, Experience, Skills, Projects).
*   **Tool 2:** `update_resume_layout` (Moves sections dynamically, e.g., Left/Right column).
*   **Special Logic:** Flattens complex schemas to prevent WebSocket crashes.

### 3. CA Sahab (Finance)
*   **Role:** Expense Tracker & Scolder.
*   **Tool:** `log_transaction` (`amount`, `source`, `type`).
*   **Behavior:** Lectures you on spending, then logs it.

### 4. Vikram (Planner)
*   **Role:** Schedule Manager.
*   **Tool:** `add_task` (`task`, `time`).
*   **Behavior:** Enforces sequential task entry to avoid parallel call errors.

---

## 💻 Local Development Setup

1.  **Clone the Repo:**
    ```bash
    git clone https://github.com/Aadya-Madankar/Bade-Bhaiya.git
    cd Bade-Bhaiya
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    *   Create a `.env` file in the root.
    *   Add your Google Gemini API Key:
    ```env
    VITE_GEMINI_API_KEY=AIzaSy...YourKeyHere
    ```

4.  **Run Dev Server:**
    ```bash
    npm run dev
    ```

---

## 🌍 Deployment (Vercel)

This project is optimized for Vercel.

1.  **Push to GitHub:**
    *   Ensure `.gitignore` includes `.env` (Critical Security).
    *   Push your code to the main branch.

2.  **Import to Vercel:**
    *   Go to Vercel Dashboard -> Add New Project -> Import from GitHub.

3.  **Environment Variables (CRITICAL):**
    *   In the Vercel Project Settings during import, expand **Environment Variables**.
    *   Key: `VITE_GEMINI_API_KEY`
    *   Value: `Your_Actual_Google_API_Key`

4.  **Deploy:** Click "Deploy". Vercel will build the React app and host it globally.

---

## 🔒 Security Note
*   The `.env` file is git-ignored to protect your API key.
*   **Do not commit real keys to GitHub.**
*   In production (Vercel), the key is effectively public to anyone inspecting network traffic (Client-Side App). For strict production security, you should proxy requests through a backend, but for this portfolio demo, the client-side key is acceptable with usage limits.
