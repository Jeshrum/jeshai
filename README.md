# JESHAI

JESHAI is a robust, local-first AI development workspace and orchestrator powered by Ollama. It enables powerful multi-agent AI workflows for seamless code generation and autonomous file execution on your local machine, prioritizing privacy, offline accessibility, and low resource utilization.

---

## 💡 Use Cases

JESHAI is designed to bridge the gap between simple AI chat and fully autonomous local development. Here are three primary ways to use it:

### 1. The "Local Dev-Loop" (Pro Developer)
**Automate the repetitive cycle of writing, testing, and fixing code.**
*   **The Flow**: You give a high-level goal (e.g., "Build a React weather component").
*   **The Action**: JESHAI’s **Architect** plans the structure, the **Frontend Engineer** writes the code, and the **QA Engineer** runs tests. If a test fails, the agents automatically refine the code until it passes.
*   **Value**: Massive time savings on boilerplate and iterative debugging.

### 2. Private Data Processing (Data Sensitive)
**Process confidential files without them ever leaving your hardware.**
*   **The Flow**: Point JESHAI to a local directory of sensitive logs or spreadsheets.
*   **The Action**: Use local models (like `qwen2.5`) to analyze, clean, or summarize data. All processing happens in RAM on your machine.
*   **Value**: 100% data privacy and compliance; no third-party API exposure.

### 3. Rapid Prototyping (Non-Technical / Product)
**Go from an idea to a working script in minutes without manual setup.**
*   **The Flow**: Describe a small tool or automation (e.g., "A Python script to bulk-rename my photos").
*   **The Action**: JESHAI generates the script and creates a `docs/` guide on how to run it.
*   **Value**: Fast realization of ideas for solo-founders and non-coders.

---

## ✨ Features

- **Local-First AI Execution**: Powered by Ollama for maximum privacy.
- **Multi-Agent Architecture**: Uses specialized roles (Architect, QA, Dev) to solve complex problems.
- **Sequential Orchestration**: Intelligent handoffs keep RAM and battery usage low on laptops.
- **Autonomous Editing**: Built-in safety guards allow agents to edit and create files directly.

---

## 🚀 Getting Started (Simplified)

### 1. Prerequisites (Setup Your Machine)
*   **Ollama**: [Download here](https://ollama.com). Open the app and make sure it's running.
*   **Node.js**: [Download here](https://nodejs.org). This runs the JESHAI engine.

### 2. Installation
Open your Terminal and run:
```bash
git clone https://github.com/Jeshrum/jeshai.git
cd jeshai
npm install
```

### 3. Usage
Want JESHAI to do something? Just ask:
```bash
# Example: Create a simple snake game
npm start -- "Create a simple python snake game"
```

---

## 📁 Project Structure (For Professionals)

- `agents/` — Modular role definitions (markdown templates for AI logic).
- `workflows/` — JSON sequences that define how agents collaborate.
- `local-ai.config.json` — Core settings for models, memory limits, and logic.
- `src/` — The high-performance TypeScript engine powering the orchestrator.

## 🛠️ Built With
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Ollama](https://ollama.com/)
- [TypeScript](https://www.typescriptlang.org/)

---
*Developed for JESHAI — Local Intelligence, Globally Capable.*
