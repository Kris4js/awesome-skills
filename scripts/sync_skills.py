#!/usr/bin/env python3
"""Link missing collected skills; never replace existing user content."""
import argparse
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]


def discover(collections):
    skills = {}
    for entry in sorted(collections.rglob("SKILL.md")):
        text = entry.read_text(encoding="utf-8")
        header = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)", text, re.S)
        match = re.search(r"(?m)^name:\s*([^\n]+)$", header.group(1)) if header else None
        name = match.group(1).strip().strip("\"'") if match else ""
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name) or name != entry.parent.name:
            raise ValueError(f"Invalid skill name: {entry}")
        if name in skills:
            raise ValueError(f"Duplicate skill name: {name}")
        skills[name] = entry.parent.resolve()
    if not skills:
        raise ValueError(f"No skills found: {collections}")
    return skills


def sync(collections, target, dry_run=False):
    skills = discover(collections)  # Validate the full catalog before any writes.
    target = target.expanduser().absolute()
    if os.path.lexists(target) and not target.is_dir():
        raise ValueError(f"Target is not a directory: {target}")
    if not dry_run:
        target.mkdir(parents=True, exist_ok=True)
    counts = {"linked": 0, "managed": 0, "skipped": 0}
    for name, source in skills.items():
        destination = target / name
        if os.path.lexists(destination):
            state = "managed" if destination.is_symlink() and destination.resolve() == source else "skipped"
        elif dry_run:
            state = "linked"
        else:
            try:
                destination.symlink_to(source, target_is_directory=True)
                state = "linked"
            except FileExistsError:  # Another process created it: preserve it.
                state = "skipped"
        counts[state] += 1
        print(f"{'would-link' if dry_run and state == 'linked' else state}: {name}")
    print(f"{'Preview' if dry_run else 'Sync'}: " + ", ".join(f"{key}={value}" for key, value in counts.items()))
    return counts


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--target", type=Path, default=Path.home() / ".agents/skills")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    try:
        sync(ROOT / "collections", args.target, args.dry_run)
    except (OSError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
