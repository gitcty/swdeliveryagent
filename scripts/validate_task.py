#!/usr/bin/env python3
"""Validate delivery task records without third-party dependencies."""

import json
import sys
from pathlib import Path

STATUSES = {"intake", "requirements_ready", "implementation", "testing", "review", "blocked", "done"}
OWNERS = {"orchestrator", "requirements", "developer", "tester", "reviewer"}
EXPECTED_OWNER = {
    "intake": "orchestrator",
    "requirements_ready": "requirements",
    "implementation": "developer",
    "testing": "tester",
    "review": "reviewer",
    "blocked": "orchestrator",
    "done": "orchestrator",
}
REQUIRED = {"id", "title", "status", "owner", "iteration", "requirements", "artifacts", "checks", "notes", "history"}


def validate(task):
    errors = []
    if not isinstance(task, dict):
        return ["root must be a JSON object"]
    missing = sorted(REQUIRED - set(task))
    if missing:
        errors.append("missing fields: " + ", ".join(missing))
        return errors
    if not isinstance(task["id"], str) or not task["id"].strip():
        errors.append("id must be a non-empty string")
    if not isinstance(task["title"], str) or not task["title"].strip():
        errors.append("title must be a non-empty string")
    if task["status"] not in STATUSES:
        errors.append("status is invalid")
    if task["owner"] not in OWNERS:
        errors.append("owner is invalid")
    elif task["status"] in EXPECTED_OWNER and task["owner"] != EXPECTED_OWNER[task["status"]]:
        errors.append(f"owner must be {EXPECTED_OWNER[task['status']]} for status {task['status']}")
    if not isinstance(task["iteration"], int) or isinstance(task["iteration"], bool) or task["iteration"] < 1:
        errors.append("iteration must be an integer of at least 1")
    req = task["requirements"]
    if not isinstance(req, dict) or set(req) != {"summary", "acceptance_criteria"}:
        errors.append("requirements must contain only summary and acceptance_criteria")
    elif not isinstance(req["summary"], str) or not isinstance(req["acceptance_criteria"], list) or not all(isinstance(x, str) and x.strip() for x in req["acceptance_criteria"]):
        errors.append("requirements fields have invalid types or empty criteria")
    for field in ("artifacts", "checks", "notes", "history"):
        if not isinstance(task[field], list):
            errors.append(f"{field} must be an array")
    if isinstance(task["history"], list) and not task["history"]:
        errors.append("history must contain at least one entry")
    if task["status"] != "intake" and isinstance(req, dict) and not req.get("acceptance_criteria"):
        errors.append("acceptance criteria are required after intake")
    if task["status"] == "done":
        checks = task["checks"] if isinstance(task["checks"], list) else []
        if not checks or any(not isinstance(c, dict) or c.get("status") != "passed" for c in checks):
            errors.append("done requires one or more passed checks and no failed or pending checks")
        history = task["history"] if isinstance(task["history"], list) else []
        if not any(isinstance(h, dict) and h.get("actor") == "reviewer" and h.get("to") == "done" for h in history):
            errors.append("done requires a reviewer approval transition")
    return errors


def main(paths):
    failed = False
    for name in paths:
        path = Path(name)
        try:
            task = json.loads(path.read_text(encoding="utf-8"))
            errors = validate(task)
        except (OSError, json.JSONDecodeError) as exc:
            errors = [str(exc)]
        if errors:
            failed = True
            for error in errors:
                print(f"{path}: {error}", file=sys.stderr)
        else:
            print(f"{path}: valid")
    return 1 if failed else 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: validate_task.py TASK.json [TASK.json ...]", file=sys.stderr)
        raise SystemExit(2)
    raise SystemExit(main(sys.argv[1:]))
