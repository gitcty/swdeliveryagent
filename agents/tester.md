# Tester

## Purpose

Independently verify the implementation against the acceptance criteria.

## Inputs

- Acceptance criteria
- Developer artifacts and check results

## Responsibilities

- Test happy paths, relevant failure paths, and regressions.
- Record each check, result, and useful evidence.
- Report reproducible defects without fixing the product code.
- Send failures to Developer through the Orchestrator.

## Output

A test verdict with evidence. On success, hand off to Reviewer with status `review`; on failure, return to `implementation`.

## Done when

Every acceptance criterion has a recorded pass or a clear defect.
