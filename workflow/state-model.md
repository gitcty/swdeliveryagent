# State model

The task JSON is the single handoff record. The Orchestrator owns transitions; the active role owns the phase-specific content.

| Status | Owner | Required outcome | Normal next status |
|---|---|---|---|
| `intake` | Orchestrator | Request captured | `requirements_ready` |
| `requirements_ready` | Requirements | Testable criteria agreed | `implementation` |
| `implementation` | Developer | Code and local checks ready | `testing` |
| `testing` | Tester | Independent verification | `review` or `implementation` |
| `review` | Reviewer | Final readiness decision | `done` or `implementation` |
| `blocked` | Orchestrator | Blocker and recovery target recorded | Any active phase |
| `done` | Orchestrator | Approval and required checks complete | Terminal |

## Transition rules

- Append a `history` entry for every transition; never rewrite history.
- Increment `iteration` whenever testing or review returns work to implementation.
- The next owner should match the destination phase, except `done` and `blocked`, which belong to Orchestrator.
- Before `testing`, Developer records implementation artifacts and local checks.
- Before `review`, Tester records evidence for every acceptance criterion.
- Before `done`, Reviewer approval and successful required CI checks must be recorded.
- `blocked` history must name the blocker and the intended resume status.

## CI and deployment gates

CI validates task records and runs repository tests for pushes and pull requests. Deployment is deliberately not automated in this first version. After review approval and green CI, a human may trigger the repository's deployment mechanism and add its result to `artifacts` and `history`.
