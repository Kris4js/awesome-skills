"""Offline checks for the speed-up-github-actions timing helper."""
import importlib.util
import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1] / "collections/devops/speed-up-github-actions"
SCRIPT = ROOT / "scripts/ci_timing.py"
spec = importlib.util.spec_from_file_location("ci_timing", SCRIPT)
assert spec and spec.loader
ci = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ci)
SETUP = __import__("re").compile(ci.DEFAULT_SETUP, __import__("re").I)


def step(name, start, end, conclusion="success"):
    return {"name": name, "conclusion": conclusion,
            "started_at": f"2026-01-01T00:{start}Z", "completed_at": f"2026-01-01T00:{end}Z"}


def job(name="test", conclusion: "str | None" = "success", steps=None):
    return {"name": name, "conclusion": conclusion,
            "created_at": "2026-01-01T00:00:00Z", "started_at": "2026-01-01T00:01:00Z",
            "completed_at": "2026-01-01T00:06:00Z",
            "steps": steps if steps is not None else [
                step("Set up job", "01:00", "01:10"),
                step("Run actions/checkout@v4", "01:10", "01:20"),
                step("Run actions/setup-node@v4", "01:20", "01:50"),
                step("Run npm ci", "01:50", "02:30"),
                step("Run npm test", "02:30", "05:50"),
                step("Post Run actions/checkout@v4", "05:50", "06:00"),
            ]}


def run(workflow="CI", jobs=None, conclusion="success"):
    return {"id": 1, "workflow": workflow, "conclusion": conclusion,
            "created_at": "2026-01-01T00:00:00Z", "run_started_at": "2026-01-01T00:00:00Z",
            "updated_at": "2026-01-01T00:06:00Z", "jobs": jobs if jobs is not None else [job()]}


class TimingTests(unittest.TestCase):
    def test_split_job_phases(self):
        parts = ci.split_job(job(), SETUP)
        self.assertEqual(parts, {"queue": 60.0, "setup": 100.0, "work": 200.0, "total": 300.0})

    def test_uncovered_time_counts_as_setup(self):
        parts = ci.split_job(job(steps=[step("Run make test", "02:00", "05:00")]), SETUP)
        self.assertEqual((parts["work"], parts["setup"]), (180.0, 120.0))

    def test_skipped_and_cancelled_jobs_excluded(self):
        for conclusion in ("skipped", "cancelled", None):
            self.assertIsNone(ci.split_job(job(conclusion=conclusion), SETUP))
        summary = ci.summarize({"runs": [run(conclusion="cancelled", jobs=[job(conclusion="cancelled")])]}, SETUP)
        self.assertEqual(summary, {"workflows": {}, "jobs": {}})

    def test_fold_matrix_variants(self):
        data = {"runs": [run(jobs=[job("test (ubuntu, 1)"), job("test (ubuntu, 2)")])]}
        self.assertEqual(ci.summarize(data, SETUP, True)["jobs"]["CI / test"]["n"], 2)
        self.assertEqual(len(ci.summarize(data, SETUP)["jobs"]), 2)

    def test_fetch_paginates_and_trims(self):
        calls = []

        def api(path):
            calls.append(path)
            if "/jobs" in path:
                return {"jobs": [job()]}
            page = int(path.split("&page=")[1].split("&")[0])
            return {"workflow_runs": [{"id": page * 10 + i, "name": "CI"} for i in range(3)] if page < 3 else []}

        data = ci.fetch("o/r", 5, branch="feat", api=api)
        self.assertEqual(len(data["runs"]), 5)
        self.assertIn("branch=feat", calls[0])
        self.assertTrue(all("status=completed" in c for c in calls if "/jobs" not in c))

    def test_report_with_baseline(self):
        with tempfile.TemporaryDirectory() as d:
            before, after = pathlib.Path(d, "before.json"), pathlib.Path(d, "after.json")
            before.write_text(json.dumps({"runs": [run()]}))
            fast = run(jobs=[job(steps=[step("Run npm test", "01:00", "03:00")])])
            fast["updated_at"] = "2026-01-01T00:03:00Z"
            after.write_text(json.dumps({"runs": [fast]}))
            out = subprocess.run([sys.executable, str(SCRIPT), "report", str(after),
                                  "--baseline", str(before)], capture_output=True, text=True, check=True).stdout
            self.assertIn("| CI | 1/1 | 6m00s | 3m00s | -50% |", out)
            self.assertIn("| CI / test |", out)

    def test_rejects_malformed_repo(self):
        result = subprocess.run([sys.executable, str(SCRIPT), "fetch", "--repo", "o/r;rm", "--output", "x"],
                                capture_output=True, text=True)
        self.assertNotEqual(result.returncode, 0)


if __name__ == "__main__":
    unittest.main()
