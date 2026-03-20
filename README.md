# JESHAI

JESHAI is a robust, local-first AI development workspace and orchestrator powered by Ollama. It enables powerful multi-agent AI workflows for seamless code generation and autonomous file execution on your local machine, prioritizing privacy, offline accessibility, and low resource utilization.

## ✨ Features

- **Local-First AI Execution**: Configured primarily for local inferencing with Ollama.
- **Multi-Agent Architecture**: Modular agent roles mapped sequentially via workflows, ensuring optimal execution without excessive RAM consumption.
- **Autonomous Editing & Guarded Writes**: Built-in parsing allows agents to directly modify and create files safely.
- **Intelligent Fallback Strategy**: Prioritizes `qwen2.5-coder:3b`, with automatic fallback to `deepseek-coder:1.3b` and `qwen2.5:3b`.

## 🚀 Getting Started

### Prerequisites
- [Ollama](https://ollama.com) must be installed and running on `http://localhost:11434`.
- [Node.js](https://nodejs.org/) (v18+ recommended).

### Installation

1. Clone the repository and navigate into the workspace.
2. Install the required dependencies:
   ```bash
   npm install
   ```
3. (Optional) Copy `.env.example` to `.env` if you need to override environment variables.

### Usage

Run the multi-agent orchestrator with your specific objective:
```bash
npm start -- "Create a simple python snake game"
```

## 📁 Project Structure

- `local-ai.config.json` - Core provider configurations, model selection, and context runtime limits.
- `agents/` - Modular markdown-based agent role definitions.
- `workflows/` - JSON/Markdown configurations mapping tasks out sequentially.
- `src/` - Orchestrator runtime logic (`index.ts`, file execution guards, and agent handlers).
- `docs/` - Extensive guides to extension, system usage, and model switching.

## 🛠️ Technologies Used
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Ollama](https://ollama.com/)
- [Zod](https://zod.dev/)
- [TypeScript](https://www.typescriptlang.org/)

---
*Developed for JESHAI.*
