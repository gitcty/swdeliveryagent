# Agent workflow

Use `workflow/task.schema.json` as the contract for task records and `workflow/state-model.md` for allowed transitions.

When asked to run a delivery cycle:

1. Act as the Orchestrator described in `agents/orchestrator.md`.
2. Use the role definitions in `agents/` for each phase.
3. Keep the task's `status`, `owner`, `artifacts`, `checks`, and `history` current.
4. Do not mark a task `done` unless acceptance criteria pass, CI is green, and review is approved.
5. Stop at deployment approval; deployment is workflow logic and requires a human decision.

Prefer the smallest change that satisfies the acceptance criteria. Surface ambiguity rather than inventing product requirements.
