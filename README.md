# Awesome Skills

可重复使用的代码技能，适用于以证据为基础、注重生产性的项目工作。

这个仓库提供了独立的技能包。首先选择适合您问题的包，然后只安装您需要的功能。

## 🌟 Acknowledgments: LINUX DO

> 🐧 **This project recognizes and thanks the [LINUX DO](https://linux.do/) community.** Many of the ideas, techniques, and production-hardened lessons behind these skills — evidence-first debugging, production-minded review, and real-world ops workflows — were inspired by the generous sharing of the LINUX DO community. Salute to the open-source spirit and pure technical exploration!

## 选择 Skill

| Skill / 系列 | 什么时候用 | 主要用途 | 文档 |
| --- | --- | --- | --- |
| Matt Pocock 系列 | 需要工程开发与协作工作流 | 38 个独立 Skill，涵盖 TDD、代码审查、任务拆解与交接 | [系列指南](collections/mattpocock/README.md) |
| `awesome-ui-kit` | 需要搭建 AI 原生前端页面 | 聊天、RAG 引用、工具调用展示与 Canvas 组件装配 | [使用指南](collections/frontend/awesome-ui-kit/README.md) |

## 推荐起点

- **测试驱动开发**：[TDD](collections/mattpocock/skills/engineering/tdd/SKILL.md)
- **审查代码变更**：[Code Review](collections/mattpocock/skills/engineering/code-review/SKILL.md)
- **整理上下文并交接**：[Handoff](collections/mattpocock/skills/productivity/handoff/SKILL.md)
- **搭建 AI 界面**：[Awesome UI Kit](collections/frontend/awesome-ui-kit/README.md)

## 安装

1. 阅读对应指南，确认授权、外部依赖和目标 Agent 的安装目录。
2. 复制所选 Skill 的**完整目录**，保留参考文件、许可证与来源记录；不要只复制 `SKILL.md` 或整个系列。
3. 按目标 Agent 的方式重新加载 Skills。

具体复制示例见 [Matt Pocock 系列指南](collections/mattpocock/README.md)。克隆本仓库不会自动安装 Skills，也不会修改全局配置。

> `awesome-ui-kit` 依赖外部 `awesome-ui` 组件库，授权仍待确认，尚未验证运行效果。使用或再分发前请阅读其 [来源与授权说明](collections/frontend/awesome-ui-kit/NOTICE.md)。

## 文档

- [Matt Pocock 系列](collections/mattpocock/README.md)：完整清单、安装与更新说明
- [Frontend 领域](collections/frontend/README.md)：前端 Skills 导航
- [Awesome UI Kit](collections/frontend/awesome-ui-kit/README.md)：组件库依赖与使用边界
- [变更记录](CHANGELOG.md)

## 仓库结构

采用“系列 + 工程领域”组织：Matt Pocock 保留独立系列，其余 Skills 按用途归类。

```text
collections/
├── mattpocock/             Matt Pocock 系列，保留上游结构
└── frontend/
    └── awesome-ui-kit/    AI 界面组件装配
tests/                     仓库基础检查
```

## 维护者入口

- 保留上游原文件；来源、固定版本和依赖记录在各目录的 `upstream.json` 中。
- 更新后同步指南、清单和 [变更记录](CHANGELOG.md)，保留适用许可证；授权不明时记录 NOTICE，不套用其他集合的许可证。
- 使用 Python 3.9+ 运行离线检查，无需第三方依赖：

```bash
python3 -B -m unittest discover -s tests -v
```

检查覆盖目录、来源记录、Skill 清单、配套文件和导航链接，不代表授权确认或实际运行验收。
