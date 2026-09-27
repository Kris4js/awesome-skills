# Quickstart

[中文](../zh/quickstart.zh-CN.md) · [Skill Matrix](skill-matrix.md) · [Docs](../README.md)

## 1. Get the files

Choose an installed client: **Codex, Pi CLI, or PI-Desktop**. The manual copy examples require Git and Bash; the clone command uses GitHub CLI (`gh`). PI-Desktop users do not need a separate Pi CLI just to follow the desktop workflow. Python 3.9+ is needed only for repository checks. Authenticate to GitHub before cloning this private repository:

```bash
gh repo clone Kris4js/awesome-skills
cd awesome-skills
```

If you already have a clone, use it. Run every installation block below from **this clone's root**, not from `doc/`. The pinned source files are under `collections/`; cloning them does not install them.

## 2. Choose one skill and one scope

Start with `tdd` for a test-first coding task, or choose another entry in the [Skill Matrix](skill-matrix.md). Install the folder containing `SKILL.md`, including its supporting files.

Use `$HOME/.agents/skills` for user scope or `.agents/skills` at the target project's root for repository scope. These portable directories are supported by [Codex](https://developers.openai.com/codex/skills) and [Pi](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md). [PI-Desktop's official guide](https://pi-desktop.app/docs/) shows the global `.agents/skills` location in its Skills settings; confirm the detected directory there, especially for project scope or older desktop versions. Choose one scope and one copy, not a separate copy per client.

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
- Repo scope: confirm `.agents/skills/tdd/SKILL.md` exists in the target project; open that project in your client.

| Client | Refresh / enable | Explicit use |
| --- | --- | --- |
| Codex | Normally detects changes automatically; restart if missing. | Select `$tdd`, then describe the task. |
| Pi CLI | Start Pi in the target project, or run `/reload` in an active session. | `/skill:tdd Add a regression test for this bug; agree on the test boundary first.` |
| PI-Desktop | Select the project → Settings → Skills. Confirm `tdd` is listed, inspect its source path, and enable its visibility switch. Open a fresh session if the active one has a stale skill list. | Ask: “Call the `Skill` tool with id `tdd` before working on this task.” Check the tool result rather than accepting a prose claim that it loaded. |

### PI-Desktop notes

- The desktop app also offers Settings → Skills → Add Skill, with global/current-project scope. Installing from that search UI may use a different upstream version; use the copy commands above when you want this repository's pinned snapshot.
- Use the actual id exposed in the current session. A packaged skill may be namespaced; if `tdd` is missing, check Settings rather than inventing an id.
- `/reload` and `/skill:tdd` above are Pi CLI instructions, not a promise that every PI-Desktop version accepts those commands. The `Skill` tool invocation is the mechanism exposed by this PI-Desktop session.
- If the copied folder is absent from the desktop list, confirm scope, selected project, app version, and configured skill sources; re-open Settings or restart the app. Do not repeatedly copy the same skill to different folders to guess the search path.

The archived `tdd` instructions conditionally call `codebase-design` when the interface itself is unclear, and refer to `code-review` for the later review stage. Read and install those companions if your task reaches those stages; this single-skill example does not install an entire workflow.

Copy verification is not agent discovery verification, and neither proves task quality. The repository tests exercise the copy commands in isolation; they do not launch Codex, Pi CLI, or PI-Desktop. This session exposes the `Skill` tool, but we have not installed and runtime-tested `tdd` in all three clients. See the [personal workflow (Chinese)](matt-pocock-workflow.md).

## 4. Update deliberately

Installed files are independent copies: updating the clone does not update installations. Compare the selected source folder with your installed copy, save any local edits, and replace only after reviewing the differences. Refresh `LICENSE.mattpocock` and `UPSTREAM.mattpocock.json` together. The source record describes the whole series, not a claim that every listed skill was installed.

The short README example keeps the original names `LICENSE` and `upstream.json` inside the installed `tdd` folder; update those files instead if you used that example. The detailed examples above use namespaced filenames. Both preserve the same license and provenance.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Copy block stops before copying | The destination already exists, possibly as a dangling symlink. Inspect it; do not remove it blindly. |
| Copy failed after creating the target | The copy is not transactional. Inspect the partial installation, preserve any local edits, and move it aside before retrying; verify the license and source record before use. |
| Source path not found | Run from the clone root and check the source folder in the matrix. |
| Skill missing in Codex | Check the selected scope, the actual `SKILL.md` path, and any disabled-skill settings; restart Codex if needed. |
| Skill missing in Pi CLI / PI-Desktop | Check the selected project, discovery diagnostics or Skills settings, and whether the skill is disabled. Use the refresh method for your client above. |
| Duplicate entries | Check user and repo scopes for the same skill name; preserve local edits before consolidating. |
| A workflow requests other skills or project configuration | Read that skill's prerequisites. Copying one skill does not configure the entire Matt Pocock workflow. |
| `awesome-ui-kit` cannot assemble a page | It does not include the `awesome-ui` component library. Read its [dependency and license notes](../../collections/frontend/awesome-ui-kit/README.md). |

## Source and validation

Sources: [Codex skills](https://developers.openai.com/codex/skills), [Pi skills](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md), and [PI-Desktop Skills settings](https://pi-desktop.app/docs/), checked on 2026-09-27. The install commands target Bash on a POSIX-style shell; no PowerShell equivalent is claimed here.

Run `python3 -B -m unittest discover -s tests -v` to check local documentation and copy examples without touching real user installations.
