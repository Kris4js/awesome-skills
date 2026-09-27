# Working in Awesome Skills

## Read on demand

- When discussing collection terminology, read [CONTEXT.md](CONTEXT.md).
- When changing installation or discovery guidance, read [Quickstart](doc/usage/quickstart.md) and verify agent-specific claims against official documentation.
- When choosing a development workflow, read [Personal workflow](doc/usage/matt-pocock-workflow.md). Small, clear changes can go directly to implementation and checks.
- When changing repository organization, read [Workflow design](doc/design/personal-skill-workflow-design.md).

## Boundaries

- Preserve upstream skill snapshots. Maintain repository-owned guides and source records separately.
- Keep `README.md` in English and update [its Chinese counterpart](doc/zh/README.zh-CN.md) in the same change. Keep both quickstarts' commands and behavior aligned.
- Keep user edits outside the task unchanged. Stage only task-related paths.
- Test installation commands in isolated temporary homes/projects, never against a user's real installation.
- Report source-copy checks, agent discovery, runtime verification, and unresolved license status separately.
- Read a skill's actual prerequisites before invoking it. Archived files are not proof that the active agent has loaded the skill.

## Checks

Use Python 3.9+ and Bash:

```bash
python3 -B -m unittest discover -s tests -v
```

Run this after documentation, source-record, or test changes. Installation examples are extracted from the Markdown and executed in temporary fixtures.
