# Matt Pocock Skills

Matt Pocock 的独立 Agent Skills 集合，作为本仓库的第一个来源集合收录。

- 上游：`https://github.com/mattpocock/skills`
- 固定版本：`c55ee46073ed923f86ce59a5eb3b6d895095d1b7`
- 收录范围：该版本的完整 `skills/` 目录，共 38 个 Skill；不包含上游插件配置、开发工具链或根目录 Agent 指令。
- 授权：[上游 MIT 许可证](LICENSE)。
- 完整入口清单：[upstream.json](upstream.json)。

## 浏览

沿用上游分类，不额外改名：

| 目录 | 内容 |
| --- | --- |
| [engineering](skills/engineering/) | 工程类 Skills |
| [productivity](skills/productivity/) | 生产力类 Skills |
| [misc](skills/misc/) | 其他工具类 Skills |
| [in-progress](skills/in-progress/) | 上游标记为开发中的 Skills，使用前单独评估 |

可先阅读 [TDD](skills/engineering/tdd/SKILL.md)、[代码审查](skills/engineering/code-review/SKILL.md)、[交接](skills/productivity/handoff/SKILL.md) 和 [项目配置](skills/engineering/setup-matt-pocock-skills/SKILL.md)。

## 使用固定快照

每个含 `SKILL.md` 的目录都是独立 Skill。复制时必须包含旁边的参考文档、模板和脚本，不能只复制 `SKILL.md`。

Codex 的用户级路径为 `$HOME/.agents/skills`，项目级路径为 `.agents/skills`。可直接运行的单 Skill 安装示例、许可证与来源记录复制方式、更新及排错，统一维护在[中文快速开始](../../doc/zh/quickstart.zh-CN.md)与 [English Quickstart](../../doc/usage/quickstart.md)。

按问题选择目录可查阅 [Skill Matrix](../../doc/usage/skill-matrix.md)；在本仓库如何实践见[个人工作流](../../doc/usage/matt-pocock-workflow.md)。

本仓库不会自动安装或运行 Skill。部分 Skills 会调用其他 Skills、命令行工具，或要求目标项目先完成配置；使用前阅读对应说明。`setup-matt-pocock-skills` 仅在需要启用其工程配置时于目标项目运行，收录文件本身不代表本仓库已经完成其配置。

## 更新约定

手动选择上游 commit，审查差异后替换 `skills/` 和许可证，并更新来源清单、数量说明及根目录变更记录。保留上游文件原文；不自动跟随 `main`。此目录不是完整上游仓库，若需上游项目文档或插件安装方式，请在上游查看对应版本。

[返回仓库首页](../../README.md)
