# Software Delivery Agent

A minimal, file-based workflow for coordinating five software-delivery roles:

1. **Orchestrator** routes work and maintains task state.
2. **Requirements** turns a request into testable acceptance criteria.
3. **Developer** implements the approved scope.
4. **Tester** verifies behavior and records evidence.
5. **Reviewer** checks the change and makes the final decision.

CI and deployment are workflow gates, not agents. Every role is intentionally described in Markdown so the setup works with any agent runner and can be refined without changing application code.

## Repository layout

```text
agents/                 Role definitions and handoff contracts
workflow/               State model, schema, and example task
scripts/validate_task.py Dependency-free task validator
tests/                  Validator tests
.github/workflows/      CI gate
web/                    Browser-based task builder
AGENTS.md               Default instructions for agent-capable tools
```

## Run the cycle

1. Copy `workflow/task.example.json` to a working file such as `tasks/feature-001.json`.
2. Give the user request and task file to the Orchestrator.
3. The Orchestrator delegates each phase using the matching file in `agents/`.
4. Each role updates its owned fields, appends a history entry, and hands control back.
5. Run `python3 scripts/validate_task.py tasks/feature-001.json` after every update.
6. Open a pull request. CI validates task files and runs tests. Deploy only after CI passes and Reviewer sets the task to `done`.

The normal path is:

```text
intake -> requirements_ready -> implementation -> testing -> review -> done
                         ^            |             |
                         +------------+-------------+
                              revisions needed
```

Any active phase may move to `blocked`; the Orchestrator records the reason and resumes at the appropriate phase once it is resolved.

## Local checks

```bash
python3 -m unittest discover -s tests
python3 scripts/validate_task.py workflow/task.example.json
```

## Task Builder GUI

The `web/` app provides a guided form, live JSON preview, validation, and a download button. To run it locally:

```bash
cd web
pnpm install
pnpm dev
```

Open the local address shown in the terminal, complete the form, and download the JSON file into `tasks/`.

## Working agreement

- Keep one task file per independently deliverable change.
- Acceptance criteria are the shared contract between roles.
- Agents do not silently expand scope; questions and decisions go in `notes` and `history`.
- Evidence should point to commands, test output, files, commits, or pull requests.
- A human remains responsible for approving production deployment.

See [workflow/state-model.md](workflow/state-model.md) for transitions and handoff rules.
