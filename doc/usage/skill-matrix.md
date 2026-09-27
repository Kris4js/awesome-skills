# Skill Matrix

Choose by the problem, not by the author. This is a **starter selection**, not a requirement to install the whole collection. See [Quickstart](quickstart.md) for installation and [Personal workflow (Chinese)](matt-pocock-workflow.md) for this repository's conventions.

## Pick by Problem

Each linked folder is the directory to copy; read its `SKILL.md` first. The paths are relative to this document, while installation commands are run from the repository root.

| Skill | When to use | Expected output | Avoid when / prerequisites |
| --- | --- | --- | --- |
| [grilling](../../collections/mattpocock/skills/productivity/grilling/) | The goal or trade-offs are still unclear | Focused questions and resolved choices | A small change already has clear acceptance criteria |
| [domain-modeling](../../collections/mattpocock/skills/engineering/domain-modeling/) | Project terms mean different things to different people | A precise glossary; an ADR only when warranted | You only need to fix wording |
| [writing-for-agents](../../collections/mattpocock/skills/productivity/writing-for-agents/) | Agent instructions are unclear or too long | Short instructions with useful reference pointers | Writing ordinary user-facing copy only |
| [to-spec](../../collections/mattpocock/skills/engineering/to-spec/) | An agreed change needs a durable specification | A spec published to the configured issue tracker | Tracker configuration is absent or publishing is not authorized |
| [to-tickets](../../collections/mattpocock/skills/engineering/to-tickets/) | The spec contains independently deliverable slices | Small tickets with blocking relationships | One small change is enough |
| [tdd](../../collections/mattpocock/skills/engineering/tdd/) | A behavior change needs test-first feedback | A failing test, minimal fix, and passing checks | The test boundary has not been agreed |
| [implement](../../collections/mattpocock/skills/engineering/implement/) | Scope and acceptance criteria are already clear | A verified implementation | The actual requirement is still unknown |
| [code-review](../../collections/mattpocock/skills/engineering/code-review/) | A completed change needs standards/spec review | Findings against a fixed base and a spec | No comparison base or spec has been identified |
| [handoff](../../collections/mattpocock/skills/productivity/handoff/) | Work must continue in another session | Current facts, evidence, and the next action | The task is finished and needs no handoff |
| [setup-matt-pocock-skills](../../collections/mattpocock/skills/engineering/setup-matt-pocock-skills/) | You want to enable tracker-dependent engineering skills | Confirmed project configuration | You only want to install or try one independent skill |
| [awesome-ui-kit](../../collections/frontend/awesome-ui-kit/) | You want component-based AI interfaces | A page assembled from the external component library | Source/license and runtime status remain unresolved; see its README |
| [archify](../../collections/architecture/archify/) | You need architecture, workflow, sequence, data-flow, or state diagrams | Validated interactive HTML diagrams | Requires Node.js 18+; pinned development snapshot; browser/export behavior needs separate verification |

## Full Snapshot Catalog

The Matt Pocock snapshot includes 38 skills. Browse its original groups without changing their structure:

- [Engineering](../../collections/mattpocock/skills/engineering/)
- [Productivity](../../collections/mattpocock/skills/productivity/)
- [Miscellaneous](../../collections/mattpocock/skills/misc/)
- [In progress](../../collections/mattpocock/skills/in-progress/) — upstream development-stage content, not a recommended default
- [Machine-readable source and complete skill list](../../collections/mattpocock/upstream.json)

The [Frontend collection](../../collections/frontend/README.md) currently contains `awesome-ui-kit`, tracked separately from the Matt Pocock series.

## Prompt Starters

- “$grilling Clarify the two unresolved decisions in this feature; stop when we have acceptance criteria.”
- “$tdd Reproduce this link-checking bug through the documented test command before changing the validator.”
- “$writing-for-agents Shorten AGENTS.md; keep paths, checks, and task-specific context pointers.”
- “$handoff Record verified work, exact commands, and the one next action; do not turn the conversation into a diary.”

A skill name in this table does not mean it is installed or available to the current agent. Read and install the required skill and supporting files before invoking it. This repository's lightweight workflow is an adaptation, not a claim that the full upstream setup has been completed.

The examples use Codex's explicit `$skill-name` selection. For Pi CLI, replace that prefix with `/skill:name` (for example `/skill:handoff`) and use `/reload` after installation. In PI-Desktop, confirm the skill is enabled in Settings → Skills, then ask the agent to call the `Skill` tool with its listed id (for example `handoff`); verify the tool result. See [Quickstart](quickstart.md) for client-specific discovery steps. Upstream `implement` requests a code review and a commit; agree on the task scope and commit boundary before invoking it, and stage only task-related files.

[Docs](../README.md) · [English overview](../../README.md) · [中文概览](../zh/README.zh-CN.md)
