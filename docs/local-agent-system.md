# Local Agent System Guide

## What this workspace uses

- Provider: `Ollama`
- Default endpoint: `http://localhost:11434`
- Preferred model order:
  1. `qwen2.5-coder:3b`
  2. `deepseek-coder:1.3b`
  3. `qwen2.5:3b`
- Execution mode: sequential handoff to reduce RAM pressure and avoid large context windows

## How to run the agents

1. Start Ollama if it is not already running:
   - `ollama serve`
2. Ensure the preferred lightweight model exists:
   - `ollama pull qwen2.5-coder:3b`
3. Run the workflow from the repository root:
   - `npm start -- "build a small feature with tests"`

The CLI reads `local-ai.config.json`, detects which preferred model is available, then executes `workflows/dev-loop.json` from top to bottom.

## Autonomous file writing

- `codeGeneration` and `editing` steps may write files automatically
- The runtime looks for an optional `## File Actions` section
- Each write must use this exact block format:
  - `<<<WRITE:relative/path.ext>>>`
  - file content
  - `<<<END_WRITE>>>`
- The runtime rejects:
  - absolute paths
  - `..` path escapes
  - writes into `.git`
  - writes into `node_modules`
- Only validated repository-relative writes are applied

## How the handoff system works

- Agent role prompts live in `agents/*.md`
- Workflow order lives in:
  - `workflows/dev-loop.json` for the runtime
  - `workflows/dev-loop.md` for humans
- Only the prior step's `## Handoff` section is forwarded to the next step
- Any `## File Actions` section is executed locally and is not forwarded as context
- This design avoids heavy context usage and works better on a 2017 MacBook with limited RAM

## How to add a new agent

1. Create a new file in `agents/`, for example `agents/security-engineer.md`
2. Include these sections:
   - `## Role definition`
   - `## Responsibilities`
   - `## Expected outputs`
   - `## Collaboration rules`
3. Add the agent to a workflow step in `workflows/dev-loop.json`
4. Update `workflows/dev-loop.md` so the human-readable guide matches the runtime

## How to change the model

Edit `local-ai.config.json`:

- Change `provider.baseUrl` to point to a different Ollama host if needed
- Reorder `modelSelection.preferred` to change the default model priority
- Change `modelSelection.defaultFor` if you want different models for:
  - planning
  - reasoning
  - code generation
  - editing

By default, all four tasks point to the selected local model so the whole system stays simple and lightweight.

## Small-model operating recommendations

- Keep outputs concise and structured
- Prefer thin-slice implementation over large multi-file rewrites
- Avoid sending full file contents between steps
- Use bullet handoffs instead of long transcripts
- Lower `runtime.maxOutputTokens` or `runtime.contextBudgetChars` if memory pressure increases