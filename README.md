# Awesome Skills

Reusable agent skills for practical engineering work, organized as upstream series and engineering domain collections. Choose a skill for your task, then install only what you need. Files under `collections/` are source snapshots; cloning this repository does not make them available to your agent.

[中文说明](doc/zh/README.zh-CN.md) · [Quickstart](doc/usage/quickstart.md) · [Skill Matrix](doc/usage/skill-matrix.md)

## Choose a Skill

| Skill / collection | When to use | Best for | Docs |
| --- | --- | --- | --- |
| Matt Pocock Skills | You need focused engineering workflows | 38 skills for planning, TDD, implementation, review, and handoff | [Guide (Chinese)](collections/mattpocock/README.md) |
| `awesome-ui-kit` | You are assembling AI-native interfaces | Chat, RAG citations, tool-call views, and canvas layouts | [Usage and dependencies (Chinese)](collections/frontend/awesome-ui-kit/README.md) |
| `bytedance-oceanengine-frontend` | You need OceanEngine-style React interfaces | A standalone skill with component guidelines, templates, reference screenshots, an interactive gallery, and verification scripts | [Guide (Chinese)](collections/frontend/bytedance-oceanengine-frontend/README.md) |
| `compact-floating-panel` | You need compact in-page floating tools | Personally maintained panel guidelines, HTML skeletons, and scoped CSS | [Guide (Chinese)](collections/frontend/compact-floating-panel/README.md) |
| `archify` | You need to explain systems and technical flows | Interactive HTML architecture, workflow, sequence, data-flow, and lifecycle diagrams | [Guide (Chinese)](collections/architecture/archify/README.md) |
| `deploy-dsh-superagent` | You are deploying a self-hosted coding agent | DSH, Feishu, repository authentication, a pinned GitLab adapter, and staged verification | [Guide (Chinese)](collections/devops/deploy-dsh-superagent/README.md) |

## Recommended Starting Points

- **Install your first skill:** [Quickstart](doc/usage/quickstart.md)
- **Pick by problem:** [Skill Matrix](doc/usage/skill-matrix.md)
- **Use Matt Pocock's approach in this repo:** [Personal workflow (Chinese)](doc/usage/matt-pocock-workflow.md)
- **Read in Chinese:** [中文说明](doc/zh/README.zh-CN.md) · [快速开始](doc/zh/quickstart.zh-CN.md)

## Install

This guide covers **Codex, Pi CLI, and PI-Desktop**. We use the portable Agent Skills directories supported by [Codex](https://developers.openai.com/codex/skills) and [Pi](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md); see [PI-Desktop's Skills settings](https://pi-desktop.app/docs/) to confirm the detected path and visibility.

| Scope | Directory |
| --- | --- |
| User: available across projects | `$HOME/.agents/skills` |
| Repository: available within a project | `.agents/skills` at that project's root |

| Method | Use when | Updates |
| --- | --- | --- |
| Copy one skill | You want selected skills and an independent installation | Compare and replace deliberately using the [Quickstart](doc/usage/quickstart.md#4-update-deliberately) |
| Link all missing skills | You want a personal checkout to supply the entire collection | Linked content follows the checkout; rerun the script for new entries |

### Copy one skill

From the clone root, install `tdd` with its license and source record. If already installed, use the [update guide](doc/usage/quickstart.md) instead.

<!-- install:tdd:user -->
```bash
mkdir -p "$HOME/.agents/skills" && mkdir "$HOME/.agents/skills/tdd" &&
cp -R collections/mattpocock/skills/engineering/tdd/. collections/mattpocock/{LICENSE,upstream.json} "$HOME/.agents/skills/tdd/"
```

After copying, choose your client:

| Client | Discover and invoke |
| --- | --- |
| Codex | Normally detects changes automatically; restart if missing, then select `$tdd`. |
| Pi CLI | Run `/reload` in an active session, then `/skill:tdd`. |
| PI-Desktop | Select the project → Settings → Skills; confirm `tdd` is listed and enabled. In a fresh session, ask the agent to call the `Skill` tool with id `tdd`; verify the tool call succeeded. |

Do not install a second copy just because you use both Codex and Pi. For repository scope, desktop discovery troubleshooting, and updates, follow the [Quickstart](doc/usage/quickstart.md).

### Link all missing skills

From the clone root, preview the changes, then create links with Python 3.9+ on a system supporting POSIX symlinks:

<!-- sync:skills -->
```bash
python3 -B scripts/sync_skills.py --dry-run
python3 -B scripts/sync_skills.py
```

The script scans every `collections/**/SKILL.md`, including development-stage skills, and creates absolute directory links under `$HOME/.agents/skills`. Use `--target /path/to/skills` for another destination. Existing files, directories, and links, including dangling links, are preserved; links already pointing to the same source are reported as `managed`. Duplicate or invalid source names stop the sync before writes.

Keep the clone at the same path. Linked content follows repository changes immediately; rerun the script after collecting or pulling new skills. Existing copies are not upgraded, removed sources are not pruned, and no background sync is installed. Editing a linked skill edits its source snapshot. Series-level licenses and source records stay in the repository.

[Codex supports symlinked skill folders](https://developers.openai.com/codex/skills). Verify discovery in your client using the steps above. See the [full link sync guide](doc/usage/quickstart.md#optional-sync-all-missing-skills-with-links) for details.

## Prerequisites and Verification

Installation does not prepare a skill's tools or external dependencies. Read its `SKILL.md` and guide before use:

| Skill | Prerequisites and limits |
| --- | --- |
| `awesome-ui-kit` | Requires the external component library and a compatible host project; component source is not bundled and licensing remains unresolved |
| `bytedance-oceanengine-frontend` | The standalone gallery requires Node.js 20.19+ or 22.12+ and npm; reference capture and browser comparison also require `ego-browser` and reference-page access; no license is declared |
| `compact-floating-panel` | Provides guidelines and assets; implement interactions and business logic in the host project; no license is declared |
| `archify` | Requires Node.js 18+; the collected version is a pinned development snapshot; browser and export behavior need separate verification |
| `deploy-dsh-superagent` | Python 3.9+ for helpers; authorized Linux/SSH, DSH, platform CLIs and credentials for deployment; skill license undeclared, upstream patch notice retained |

Each collection keeps its own source and license records. File integrity and installation checks do not establish agent discovery, runtime behavior, or permission to redistribute. Check the linked guides and `upstream.json` records for each skill's status.

## Docs

- [Documentation index](doc/README.md)
- [Quickstart](doc/usage/quickstart.md) and [Skill Matrix](doc/usage/skill-matrix.md)
- [Personal Matt Pocock workflow (Chinese)](doc/usage/matt-pocock-workflow.md)
- [Workflow design (Chinese)](doc/design/personal-skill-workflow-design.md) and [project vocabulary](CONTEXT.md)
- [Frontend collection (Chinese)](collections/frontend/README.md)
- [DevOps collection (Chinese)](collections/devops/README.md)
- [Architecture collection (Chinese)](collections/architecture/README.md)
- [Changelog (Chinese)](CHANGELOG.md)

## Repository Layout

```text
collections/
├── mattpocock/             Preserved upstream series
├── frontend/               Frontend interface skills
├── architecture/           Architecture and technical visualization
└── devops/                 Self-hosted agents and deployment workflows
doc/
├── usage/                  Installation, selection, and workflow guides
├── zh/                     Chinese overview and quickstart
└── design/                 This repository's design decisions
AGENTS.md                   Short instructions for work in this repository
CONTEXT.md                  Shared project vocabulary
scripts/                    Optional skill link synchronization
tests/                      Repository and documentation checks
```

## For Maintainers

Keep upstream snapshots unchanged. Update their source records and guides together. Maintain this English README and its [Chinese counterpart](doc/zh/README.zh-CN.md) in the same change.

Run the checks with Python 3.9+ and Bash:

```bash
python3 -B -m unittest discover -s tests -v
```

Tests check metadata, source integrity, local links, installation examples, and link synchronization. Installation and sync checks run in temporary directories, never against real user installations. Report source-copy checks, agent discovery, runtime verification, and unresolved license status separately. See the [workflow guide (Chinese)](doc/usage/matt-pocock-workflow.md) before changing repository conventions.

## Acknowledgments: LINUX DO

> 🐧 **This project recognizes and thanks the [LINUX DO](https://linux.do/) community.** Many of the ideas, techniques, and production-hardened lessons behind these skills — evidence-first debugging, production-minded review, and real-world ops workflows — were inspired by the generous sharing of the LINUX DO community. Salute to the open-source spirit and pure technical exploration!
