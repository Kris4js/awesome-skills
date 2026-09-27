# Awesome Skills

Reusable agent skills for practical engineering work. Choose a skill for your task, then install only what you need.

[中文说明](doc/zh/README.zh-CN.md) · [Quickstart](doc/usage/quickstart.md) · [Skill Matrix](doc/usage/skill-matrix.md)

## Choose a Skill

| Skill / collection | When to use | Best for | Docs |
| --- | --- | --- | --- |
| Matt Pocock series | You need focused engineering workflows | 38 skills for planning, TDD, implementation, review, and handoff | [Series guide (Chinese)](collections/mattpocock/README.md) |
| `awesome-ui-kit` | You are assembling AI-native interfaces | Chat, RAG citations, tool-call views, and canvas layouts | [Usage and dependencies (Chinese)](collections/frontend/awesome-ui-kit/README.md) |

## Recommended Starting Points

- **Install your first skill:** [Quickstart](doc/usage/quickstart.md)
- **Pick by problem:** [Skill Matrix](doc/usage/skill-matrix.md)
- **Use Matt Pocock's approach in this repo:** [Personal workflow (Chinese)](doc/usage/matt-pocock-workflow.md)
- **Read in Chinese:** [中文说明](doc/zh/README.zh-CN.md) · [快速开始](doc/zh/quickstart.zh-CN.md)

## Install

For Codex, the [official skill locations](https://developers.openai.com/codex/skills) include:

| Scope | Directory |
| --- | --- |
| User: available across projects | `$HOME/.agents/skills` |
| Repository: available within a project | `.agents/skills` at that project's root |

From this clone's root, install **one skill**, for example `tdd`, with its license and source record. This Bash example stops if a `tdd` installation or symlink already exists.

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

Codex normally detects skill changes automatically. If `tdd` does not appear, restart Codex, then select it with `$tdd`. For repository scope, another project, updates, and troubleshooting, follow the [Quickstart](doc/usage/quickstart.md).

Cloning this repository does not install its collections. Other agents may use different discovery paths. `awesome-ui-kit` requires an external component library; its [license status and runtime verification remain unresolved](collections/frontend/awesome-ui-kit/NOTICE.md).

## Docs

- [Documentation index](doc/README.md)
- [Quickstart](doc/usage/quickstart.md) and [Skill Matrix](doc/usage/skill-matrix.md)
- [Personal Matt Pocock workflow (Chinese)](doc/usage/matt-pocock-workflow.md)
- [Workflow design (Chinese)](doc/design/personal-skill-workflow-design.md) and [project vocabulary](CONTEXT.md)
- [Frontend collection (Chinese)](collections/frontend/README.md)
- [Changelog (Chinese)](CHANGELOG.md)

## Repository Layout

```text
collections/
├── mattpocock/             Preserved upstream series
└── frontend/               Skills grouped by engineering domain
doc/
├── usage/                  Installation, selection, and workflow guides
├── zh/                     Chinese overview and quickstart
└── design/                 This repository's design decisions
AGENTS.md                   Short instructions for work in this repository
CONTEXT.md                  Shared project vocabulary
tests/                      Repository and documentation checks
```

## For Maintainers

Keep upstream snapshots unchanged. Update their source records and guides together. Maintain this English README and its [Chinese counterpart](doc/zh/README.zh-CN.md) in the same change.

Run the checks with Python 3.9+ and Bash:

```bash
python3 -B -m unittest discover -s tests -v
```

Tests check metadata, local links, and installation examples in temporary directories. They do not certify licenses or runtime behavior. See the [workflow guide (Chinese)](doc/usage/matt-pocock-workflow.md) before changing repository conventions.

## Acknowledgments: LINUX DO

> 🐧 **This project recognizes and thanks the [LINUX DO](https://linux.do/) community.** Many of the ideas, techniques, and production-hardened lessons behind these skills — evidence-first debugging, production-minded review, and real-world ops workflows — were inspired by the generous sharing of the LINUX DO community. Salute to the open-source spirit and pure technical exploration!
