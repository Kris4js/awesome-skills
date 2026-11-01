#!/usr/bin/env python3
"""Split GitHub Actions jobs into queue, setup and work time; compare runs.

fetch:  read recent completed runs and their jobs with the gh CLI into JSON.
report: summarize medians per workflow and job, optionally against a baseline.
Standard library only; network access happens solely through `gh api`.
"""
import argparse
import json
import re
import statistics
import subprocess
import sys
from datetime import datetime

DEFAULT_SETUP = (
    r"^(set up job|complete job|post |checkout|run actions/checkout|"
    r"(run )?[\w.-]+/setup-|setup |set up |install|restore|cache|download|"
    r"(run )?[\w.-]+/(cache|rust-cache|install-action|setup-[\w-]+)|"
    r"(run )?docker/(setup|login))"
    r"|\b(npm|pnpm|yarn|bun) (ci|install)\b|\bpip install\b|\bapt(-get)? install\b"
    r"|\bgo mod download\b|\bcargo fetch\b|\bbrew install\b"
)
SKIP_CONCLUSIONS = {"skipped", "cancelled", None}


def ts(value):
    if not value:
        return None
    return datetime.strptime(value, "%Y-%m-%dT%H:%M:%SZ")


def seconds(start, end):
    a, b = ts(start), ts(end)
    if a is None or b is None:
        return None
    return max(0.0, (b - a).total_seconds())


def split_job(job, setup_re):
    """Return queue/setup/work/total seconds for one job, or None if unusable."""
    if job.get("conclusion") in SKIP_CONCLUSIONS:
        return None
    queue = seconds(job.get("created_at"), job.get("started_at"))
    total = seconds(job.get("started_at"), job.get("completed_at"))
    if total is None:
        return None
    setup = work = 0.0
    for step in job.get("steps") or []:
        duration = seconds(step.get("started_at"), step.get("completed_at"))
        if duration is None or step.get("conclusion") == "skipped":
            continue
        if setup_re.search(step.get("name", "").strip().lower()):
            setup += duration
        else:
            work += duration
    # Time not covered by steps (runner provisioning, gaps) counts as setup.
    setup += max(0.0, total - setup - work)
    return {"queue": queue or 0.0, "setup": setup, "work": work, "total": total}


def gh_api(path):
    result = subprocess.run(["gh", "api", path], capture_output=True, text=True)
    if result.returncode:
        raise SystemExit(f"gh api {path} failed: {result.stderr.strip()}")
    return json.loads(result.stdout)


def fetch(repo, limit, branch=None, event=None, workflow=None, api=gh_api):
    runs, page = [], 1
    while len(runs) < limit:
        query = f"per_page={min(100, limit)}&page={page}&status=completed"
        if branch:
            query += f"&branch={branch}"
        if event:
            query += f"&event={event}"
        base = f"repos/{repo}/actions/workflows/{workflow}/runs" if workflow \
            else f"repos/{repo}/actions/runs"
        batch = api(f"{base}?{query}").get("workflow_runs", [])
        if not batch:
            break
        runs.extend(batch)
        page += 1
    records = []
    for run in runs[:limit]:
        jobs = api(f"repos/{repo}/actions/runs/{run['id']}/jobs?per_page=100").get("jobs", [])
        records.append({
            "id": run["id"], "workflow": run.get("name"), "event": run.get("event"),
            "branch": run.get("head_branch"), "sha": run.get("head_sha"),
            "conclusion": run.get("conclusion"), "created_at": run.get("created_at"),
            "run_started_at": run.get("run_started_at"), "updated_at": run.get("updated_at"),
            "jobs": [{k: job.get(k) for k in ("name", "conclusion", "created_at",
                                                "started_at", "completed_at", "labels")}
                     | {"steps": [{k: s.get(k) for k in ("name", "conclusion",
                                                          "started_at", "completed_at")}
                                  for s in job.get("steps") or []]}
                     for job in jobs],
        })
    return {"repo": repo, "runs": records}


def median(values):
    return round(statistics.median(values), 1) if values else None


def matrix_base(name):
    """Fold matrix variants such as 'test (ubuntu, 3)' into 'test'."""
    return re.sub(r"\s*\(.*\)\s*$", "", name or "")


def summarize(data, setup_re, fold_matrix=False):
    workflows, jobs = {}, {}
    for run in data["runs"]:
        name = run.get("workflow") or "?"
        if run.get("conclusion") not in SKIP_CONCLUSIONS:
            wall = seconds(run.get("run_started_at") or run.get("created_at"), run.get("updated_at"))
            if wall is not None:
                workflows.setdefault(name, []).append(wall)
        for job in run.get("jobs", []):
            parts = split_job(job, setup_re)
            if parts is None:
                continue
            job_name = matrix_base(job["name"]) if fold_matrix else job["name"]
            bucket = jobs.setdefault((name, job_name), {k: [] for k in parts})
            for key, value in parts.items():
                bucket[key].append(value)
    return {
        "workflows": {k: {"n": len(v), "wall": median(v)} for k, v in sorted(workflows.items())},
        "jobs": {f"{w} / {j}": {"n": len(v["total"]), **{k: median(x) for k, x in v.items()}}
                 for (w, j), v in sorted(jobs.items())},
    }


def fmt(value):
    if value is None:
        return "-"
    minutes, secs = divmod(int(round(value)), 60)
    return f"{minutes}m{secs:02d}s" if minutes else f"{secs}s"


def delta(before, after):
    if before in (None, 0) or after is None:
        return "-"
    return f"{(after - before) / before * 100:+.0f}%"


def render(summary, baseline=None):
    lines = []
    if baseline is None:
        lines += ["| Workflow | n | Wall (median) |", "| --- | --- | --- |"]
        lines += [f"| {k} | {v['n']} | {fmt(v['wall'])} |" for k, v in summary["workflows"].items()]
        lines += ["", "| Job | n | Queue | Setup | Work | Total |", "| --- | --- | --- | --- | --- | --- |"]
        lines += [f"| {k} | {v['n']} | {fmt(v['queue'])} | {fmt(v['setup'])} | {fmt(v['work'])} | "
                  f"{fmt(v['total'])} |" for k, v in summary["jobs"].items()]
        return "\n".join(lines)
    lines += ["| Workflow | n before/after | Before | After | Change |", "| --- | --- | --- | --- | --- |"]
    for k in sorted(set(summary["workflows"]) | set(baseline["workflows"])):
        b, a = baseline["workflows"].get(k, {}), summary["workflows"].get(k, {})
        lines.append(f"| {k} | {b.get('n', 0)}/{a.get('n', 0)} | {fmt(b.get('wall'))} | "
                     f"{fmt(a.get('wall'))} | {delta(b.get('wall'), a.get('wall'))} |")
    lines += ["", "| Job | n before/after | Queue | Setup | Work | Total | Change |",
              "| --- | --- | --- | --- | --- | --- | --- |"]
    for k in sorted(set(summary["jobs"]) | set(baseline["jobs"])):
        b, a = baseline["jobs"].get(k, {}), summary["jobs"].get(k, {})
        cells = [f"{fmt(b.get(p))} → {fmt(a.get(p))}" for p in ("queue", "setup", "work", "total")]
        lines.append(f"| {k} | {b.get('n', 0)}/{a.get('n', 0)} | " + " | ".join(cells)
                     + f" | {delta(b.get('total'), a.get('total'))} |")
    return "\n".join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description="Split GitHub Actions jobs into queue, setup and work time.")
    sub = parser.add_subparsers(dest="command", required=True)
    f = sub.add_parser("fetch", help="download recent completed runs via gh")
    f.add_argument("--repo", required=True, help="OWNER/REPO")
    f.add_argument("--limit", type=int, default=50)
    f.add_argument("--branch")
    f.add_argument("--event", help="e.g. pull_request, push")
    f.add_argument("--workflow", help="workflow file name or id")
    f.add_argument("--output", required=True)
    r = sub.add_parser("report", help="summarize a fetched file")
    r.add_argument("input")
    r.add_argument("--baseline", help="earlier fetched file to compare against")
    r.add_argument("--setup-pattern", help="extra regex for setup step names (case-insensitive)")
    r.add_argument("--fold-matrix", action="store_true", help="merge matrix variants per job")
    r.add_argument("--json", action="store_true", help="print the summary as JSON")
    args = parser.parse_args(argv)

    if args.command == "fetch":
        if not re.fullmatch(r"[\w.-]+/[\w.-]+", args.repo):
            parser.error("--repo must look like OWNER/REPO")
        data = fetch(args.repo, args.limit, args.branch, args.event, args.workflow)
        with open(args.output, "w", encoding="utf-8") as handle:
            json.dump(data, handle, indent=1)
        jobs = sum(len(run["jobs"]) for run in data["runs"])
        print(f"saved {len(data['runs'])} runs, {jobs} jobs to {args.output}")
        return 0

    pattern = DEFAULT_SETUP + (f"|{args.setup_pattern}" if args.setup_pattern else "")
    setup_re = re.compile(pattern, re.I)

    def load(path):
        with open(path, encoding="utf-8") as handle:
            return summarize(json.load(handle), setup_re, args.fold_matrix)

    summary = load(args.input)
    baseline = load(args.baseline) if args.baseline else None
    if args.json:
        print(json.dumps({"summary": summary, "baseline": baseline}, indent=1, ensure_ascii=False))
    else:
        print(render(summary, baseline))
    return 0


if __name__ == "__main__":
    sys.exit(main())
