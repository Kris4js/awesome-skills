# Quickstart

[中文](../zh/quickstart.zh-CN.md) · [Skill Matrix](skill-matrix.md) · [Docs](../README.md)

## 1. Get the files

Use Git, Bash, GitHub CLI (`gh`), and an installed Codex client. Python 3.9+ is needed only for this repository's checks, not for copying a skill. Authenticate to GitHub before cloning this private repository:

```bash
gh repo clone Kris4js/awesome-skills
cd awesome-skills
```

If you already have a clone, use it. Run every installation block below from **this clone's root**, not from `doc/`. The pinned source files are under `collections/`; cloning them does not install them.

## 2. Choose one skill and one scope

Start with `tdd` for a test-first coding task, or choose another entry in the [Skill Matrix](skill-matrix.md). Install the folder containing `SKILL.md`, including its supporting files.

Codex's [official documentation](https://developers.openai.com/codex/skills) lists `$HOME/.agents/skills` for user scope and `.agents/skills` within a repository for repo scope. Choose one scope to avoid duplicate skill names. These paths are for Codex; consult another agent's documentation before using them there.

### User scope

Available across projects. This example copies `tdd`, the series license, and its pinned source record. The two `test` commands reject an existing target, including a dangling symlink.

<!-- install:tdd:user -->
```bash
(
  set -eu
  dest="$HOME/.agents/skills"
  test ! -e "$dest/tdd"
  test ! -L "$dest/tdd"
  mkdir -p "$dest"
  cp -R collections/mattpocock/skills/engineering/tdd "$dest/tdd"
  cp collections/mattpocock/LICENSE "$dest/tdd/LICENSE.mattpocock"
  cp collections/mattpocock/upstream.json "$dest/tdd/UPSTREAM.mattpocock.json"
)
```

### Repository scope

Run this alternative to make `tdd` available in **this clone**. To install into another project, change only `dest` to that project's absolute `.agents/skills` path; keep the working directory here so the source paths still resolve.

<!-- install:tdd:repo -->
```bash
(
  set -eu
  dest=".agents/skills"
  test ! -e "$dest/tdd"
  test ! -L "$dest/tdd"
  mkdir -p "$dest"
  cp -R collections/mattpocock/skills/engineering/tdd "$dest/tdd"
  cp collections/mattpocock/LICENSE "$dest/tdd/LICENSE.mattpocock"
  cp collections/mattpocock/upstream.json "$dest/tdd/UPSTREAM.mattpocock.json"
)
```

In this archive repository, treat installed copies as local working files, not a second maintained snapshot. Review `git status` before staging; choose explicitly whether another target project should version its own installed skills.

## 3. Verify discovery and try a bounded task

- User scope: confirm `$HOME/.agents/skills/tdd/SKILL.md` exists.
- Repo scope: confirm `.agents/skills/tdd/SKILL.md` exists in the target project; launch Codex there.
- Codex normally detects changes automatically. Restart it if the skill does not appear, then type `$tdd` to select it.
- Try: “$tdd Add a regression test for this specific bug. Agree on the test boundary first, then implement the smallest fix.”

The archived `tdd` instructions conditionally call `codebase-design` when the interface itself is unclear, and refer to `code-review` for the later review stage. Read and install those companions if your task reaches those stages; this single-skill example does not install an entire workflow.

Copy verification is not agent discovery verification, and neither proves the skill's task quality. The repository tests exercise the copy commands in isolation; they do not launch Codex. For a first task in this repo, see the [personal workflow (Chinese)](matt-pocock-workflow.md).

## 4. Update deliberately

Installed files are independent copies: updating the clone does not update installations. Compare the selected source folder with your installed copy, save any local edits, and replace only after reviewing the differences. Refresh `LICENSE.mattpocock` and `UPSTREAM.mattpocock.json` together. The source record describes the whole series, not a claim that every listed skill was installed.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Copy block stops before copying | The destination already exists, possibly as a dangling symlink. Inspect it; do not remove it blindly. |
| Copy failed after creating the target | The copy is not transactional. Inspect the partial installation, preserve any local edits, and move it aside before retrying; verify the license and source record before use. |
| Source path not found | Run from the clone root and check the source folder in the matrix. |
| Skill missing in Codex | Check the selected scope, the actual `SKILL.md` path, and any disabled-skill settings; restart Codex if needed. |
| Duplicate entries | Check user and repo scopes for the same skill name; preserve local edits before consolidating. |
| A workflow requests other skills or project configuration | Read that skill's prerequisites. Copying one skill does not configure the entire Matt Pocock workflow. |
| `awesome-ui-kit` cannot assemble a page | It does not include the `awesome-ui` component library. Read its [dependency and license notes](../../collections/frontend/awesome-ui-kit/README.md). |

## Source and validation

Codex paths and reload guidance were checked against the [official skill documentation](https://developers.openai.com/codex/skills) on 2026-09-27. The install commands target Bash on a POSIX-style shell; no PowerShell equivalent is claimed here.

Run `python3 -B -m unittest discover -s tests -v` to check local documentation and copy examples without touching real user installations.
