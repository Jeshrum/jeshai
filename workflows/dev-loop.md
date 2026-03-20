# Autonomous Development Loop

Mode: `sequential-handoff`

Purpose: run a lean multi-agent development cycle on a small local Ollama model without carrying the full conversation history into every step.

## Step ownership

1. **Project goal analysis** — `product-manager`
   - Clarifies goal, scope, constraints, acceptance criteria, and risks.
   - Hands off a compact project brief.

2. **System architecture planning** — `architect`
   - Defines system boundaries, interfaces, data flow, and trade-offs.
   - Hands off file-level architecture guidance.

3. **Task breakdown** — `product-manager`
   - Converts the architecture into a thin-slice execution sequence.
   - Hands off a numbered checklist and success criteria.

4. **Code implementation** — `backend-engineer`
   - Primary implementation owner for application logic.
   - `frontend-engineer` and `devops-engineer` collaborate when UI or environment work is required.
   - Hands off changed files and review focus.

5. **Code review** — `code-auditor`
   - Audits correctness, maintainability, and spec alignment.
   - Hands off only defects, gaps, and review findings.

6. **QA testing** — `qa-engineer`
   - Verifies expected behavior, regression safety, and edge cases.
   - Hands off tested scenarios and documentation needs.

7. **Documentation generation** — `documentation-writer`
   - Produces the final change summary and user-facing notes.
   - Hands off a release-ready summary.

## Sequential task passing rules

- Each step receives only:
  - the original project goal
  - the previous step handoff
  - the current step objective
- Each step must return:
  - `## Summary`
  - `## Deliverable`
  - `## Handoff`
- The `## Handoff` section is the only context forwarded to the next step.
- This keeps the workflow reliable on lightweight local models and limited RAM.