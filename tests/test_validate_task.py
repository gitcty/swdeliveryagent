import unittest

from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from validate_task import validate


def task(status="intake", owner="orchestrator"):
    return {
        "id": "T-1", "title": "Test", "status": status, "owner": owner, "iteration": 1,
        "requirements": {"summary": "A change", "acceptance_criteria": ["It works"]},
        "artifacts": [], "checks": [], "notes": [],
        "history": [{"at": "2026-01-01T00:00:00Z", "actor": "human", "from": None, "to": "intake", "summary": "Created"}],
    }


class ValidateTaskTests(unittest.TestCase):
    def test_valid_intake(self):
        self.assertEqual(validate(task()), [])

    def test_owner_must_match_phase(self):
        self.assertIn("owner must be tester for status testing", validate(task("testing", "developer")))

    def test_done_needs_checks_and_reviewer(self):
        errors = validate(task("done", "orchestrator"))
        self.assertTrue(any("passed checks" in error for error in errors))
        self.assertTrue(any("reviewer approval" in error for error in errors))

    def test_valid_done(self):
        value = task("done", "orchestrator")
        value["checks"] = [{"name": "CI", "status": "passed", "evidence": "run 1"}]
        value["history"].append({"at": "2026-01-01T01:00:00Z", "actor": "reviewer", "from": "review", "to": "done", "summary": "Approved"})
        self.assertEqual(validate(value), [])


if __name__ == "__main__":
    unittest.main()
