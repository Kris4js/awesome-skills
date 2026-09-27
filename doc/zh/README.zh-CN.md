# Awesome Skills

面向实际工程任务的可复用 Agent Skills。先按问题选择 Skill，再只安装需要的部分。

[English](../../README.md) · [快速开始](quickstart.zh-CN.md) · [Skill 选择指南](../usage/skill-matrix.md)

## 选择 Skill

| Skill / 系列 | 什么时候用 | 主要用途 | 文档 |
| --- | --- | --- | --- |
| Matt Pocock 系列 | 需要聚焦的工程工作流 | 38 个 Skill，涵盖规划、TDD、实现、审查与交接 | [系列指南](../../collections/mattpocock/README.md) |
| `awesome-ui-kit` | 需要搭建 AI 原生界面 | 聊天、RAG 引用、工具调用展示与 Canvas 装配 | [使用与依赖](../../collections/frontend/awesome-ui-kit/README.md) |

## 推荐起点

- **安装第一个 Skill**：[快速开始](quickstart.zh-CN.md)
- **按问题选择**：[Skill 选择指南](../usage/skill-matrix.md)
- **在本仓库运用 Matt Pocock 的方法**：[个人工作流](../usage/matt-pocock-workflow.md)
- **阅读英文文档**：[English overview](../../README.md) · [Quickstart](../usage/quickstart.md)

## 安装

Codex 的[官方 Skill 路径](https://developers.openai.com/codex/skills)包括：

| 范围 | 目录 |
| --- | --- |
| 用户级：跨项目可用 | `$HOME/.agents/skills` |
| 项目级：仅目标项目可用 | 目标项目根目录的 `.agents/skills` |

在本仓库克隆目录的根目录运行以下 Bash 示例，安装单个 `tdd`，同时保留许可证与来源记录。若已有同名目录或软链接，命令会停止，不覆盖已有内容。

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

Codex 通常会自动发现 Skill 变更；若未显示，重启 Codex，再通过 `$tdd` 选择。项目级安装、其他项目安装、更新与排错见[快速开始](quickstart.zh-CN.md)。

克隆仓库不等于安装其中的 Skills，其他 Agent 的发现路径也可能不同。`awesome-ui-kit` 需要外部组件库，其[授权状态和运行验证仍待确认](../../collections/frontend/awesome-ui-kit/NOTICE.md)。

## 文档

- [文档索引](../README.md)
- [快速开始](quickstart.zh-CN.md)与 [Skill 选择指南](../usage/skill-matrix.md)
- [Matt Pocock 个人工作流](../usage/matt-pocock-workflow.md)
- [工作流设计](../design/personal-skill-workflow-design.md)与[项目术语](../../CONTEXT.md)
- [Frontend 领域](../../collections/frontend/README.md)
- [变更记录](../../CHANGELOG.md)

## 仓库结构

```text
collections/
├── mattpocock/             保留上游结构的独立系列
└── frontend/               按工程领域收录的 Skills
doc/
├── usage/                  安装、选择与工作流指南
├── zh/                     中文概览和快速开始
└── design/                 本仓库自己的设计决策
AGENTS.md                   面向 Agent 的简短仓库约定
CONTEXT.md                  共用项目术语
tests/                      仓库和文档检查
```

## 维护者入口

保持上游快照原文不变，更新时同步来源记录与指南。英文 README 和本中文页应在同一次改动中维护。

使用 Python 3.9+ 和 Bash 运行检查：

```bash
python3 -B -m unittest discover -s tests -v
```

测试在临时目录检查元数据、本地链接和安装示例，不代表授权确认或运行效果验收。修改仓库约定前请阅读[工作流指南](../usage/matt-pocock-workflow.md)。

## 致谢：LINUX DO

感谢 [LINUX DO](https://linux.do/) 社区。社区对证据驱动调试、生产级审查和实际运维经验的分享，为这些技能背后的思路提供了启发。致敬开放分享和技术探索的精神。
