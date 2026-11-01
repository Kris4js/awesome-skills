# Awesome Skills

面向实际工程任务的可复用 Agent Skills，按上游系列和工程领域组织。先按问题选择 Skill，再只安装需要的部分。`collections/` 保存来源快照；克隆仓库不会让 Agent 自动发现其中的 Skill。

[English](../../README.md) · [快速开始](quickstart.zh-CN.md) · [Skill 选择指南](../usage/skill-matrix.md)

## 选择 Skill

| Skill / 系列 | 什么时候用 | 主要用途 | 文档 |
| --- | --- | --- | --- |
| Matt Pocock Skills | 需要聚焦的工程工作流 | 38 个 Skill，涵盖规划、TDD、实现、审查与交接 | [使用指南](../../collections/mattpocock/README.md) |
| `awesome-ui-kit` | 需要搭建 AI 原生界面 | 聊天、RAG 引用、工具调用展示与 Canvas 装配 | [使用与依赖](../../collections/frontend/awesome-ui-kit/README.md) |
| `bytedance-oceanengine-frontend` | 需要巨量引擎风格的 React 界面 | 独立 Skill，提供组件规范、模板、参考截图、交互预览与验证脚本 | [使用指南](../../collections/frontend/bytedance-oceanengine-frontend/README.md) |
| `tencent-beacon-frontend` | 需要腾讯灯塔风格的数据工作台 | 独立 Skill，包含三栏工作台、对话输入区、数据集浏览、MySQL 连接表单与本地交互检查 | [使用指南](../../collections/frontend/tencent-beacon-frontend/README.md) |
| `compact-floating-panel` | 需要网页内紧凑悬浮工具窗口 | 个人维护的浮窗规范、HTML 骨架与隔离样式 | [使用指南](../../collections/frontend/compact-floating-panel/README.md) |
| `archify` | 需要解释系统结构和技术流程 | 交互式 HTML 架构图、工作流、时序图、数据流与生命周期图 | [使用指南](../../collections/architecture/archify/README.md) |
| `deploy-dsh-superagent` | 需要部署自托管编码智能体 | DSH、飞书、仓库认证、固定基线 GitLab 补丁与分阶段验收 | [使用指南](../../collections/devops/deploy-dsh-superagent/README.md) |
| `speed-up-github-actions` | GitHub Actions CI 太慢 | 排队/准备/执行耗时拆分、按证据提速且不删减校验、前后对比 | [使用指南](../../collections/devops/speed-up-github-actions/README.md) |

## 推荐起点

- **安装第一个 Skill**：[快速开始](quickstart.zh-CN.md)
- **按问题选择**：[Skill 选择指南](../usage/skill-matrix.md)
- **在本仓库运用 Matt Pocock 的方法**：[个人工作流](../usage/matt-pocock-workflow.md)
- **阅读英文文档**：[English overview](../../README.md) · [Quickstart](../usage/quickstart.md)

## 安装

本指南覆盖 **Codex、Pi CLI 和 PI-Desktop**。统一采用 [Codex](https://developers.openai.com/codex/skills) 和 [Pi](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md) 支持的通用 Agent Skills 目录；PI-Desktop 中请通过[技能设置](https://pi-desktop.app/docs/)确认发现的路径和可见性。

| 范围 | 目录 |
| --- | --- |
| 用户级：跨项目可用 | `$HOME/.agents/skills` |
| 项目级：仅目标项目可用 | 目标项目根目录的 `.agents/skills` |

| 方式 | 适用情况 | 更新方式 |
| --- | --- | --- |
| 复制单个 Skill | 按需安装，保留独立副本 | 按[快速开始](quickstart.zh-CN.md#4-有意识地更新)比较后替换 |
| 链接全部缺少的 Skill | 个人使用，希望由此仓库提供全部收录内容 | 链接内容随仓库更新；新增条目需重跑脚本 |

### 复制单个 Skill

在克隆根目录安装 `tdd`，同时保留许可证与来源记录。已有安装时请改用[更新指南](quickstart.zh-CN.md)。

<!-- install:tdd:user -->
```bash
mkdir -p "$HOME/.agents/skills" && mkdir "$HOME/.agents/skills/tdd" &&
cp -R collections/mattpocock/skills/engineering/tdd/. collections/mattpocock/{LICENSE,upstream.json} "$HOME/.agents/skills/tdd/"
```

复制后，按客户端分别操作：

| 客户端 | 发现与调用 |
| --- | --- |
| Codex | 通常自动发现；未显示时重启，再通过 `$tdd` 选择。 |
| Pi CLI | 已有会话执行 `/reload`，再用 `/skill:tdd`。 |
| PI-Desktop | 选择项目 → 设置 → 技能，确认 `tdd` 已显示并启用。在新会话中要求 Agent 使用 `Skill` 工具加载 id `tdd`，确认工具调用成功。 |

同时使用 Codex 和 Pi 时无需再装一份。项目级安装、桌面端发现排错与更新方式见[快速开始](quickstart.zh-CN.md)。

### 链接全部缺少的 Skill

在仓库根目录先预览，再创建链接；需要 Python 3.9+ 和支持 POSIX 符号链接的系统：

<!-- sync:skills -->
```bash
python3 -B scripts/sync_skills.py --dry-run
python3 -B scripts/sync_skills.py
```

脚本扫描全部 `collections/**/SKILL.md`，包括开发阶段 Skill，并在 `$HOME/.agents/skills` 中创建指向源目录的绝对路径链接。可用 `--target /path/to/skills` 指定其他目录。已有文件、目录和链接（包括失效链接）均保留；已指向同一来源的链接显示为 `managed`。源名称重复或不合法时，在写入前终止。

仓库需保留在原路径。链接内容随仓库修改即时更新；新增或拉取新 Skill 后需重跑脚本。已有副本不自动升级，删除来源不自动清理旧链接，也不安装后台同步任务。编辑链接中的文件就是编辑源快照。系列级许可证和来源记录仍保留在仓库中。

[Codex 支持符号链接形式的 Skill 目录](https://developers.openai.com/codex/skills)。各客户端仍需按上文确认发现，详细说明见[链接同步流程](quickstart.zh-CN.md#可选链接同步全部缺少的-skill)。

## 前置条件与验证边界

安装不会自动准备 Skill 所需工具或外部依赖。使用前阅读其 `SKILL.md` 和指南：

| Skill | 前置条件与限制 |
| --- | --- |
| `awesome-ui-kit` | 依赖外部组件库和兼容的宿主项目；未附组件源码，授权仍待确认 |
| `bytedance-oceanengine-frontend` | 独立预览需要 Node.js 20.19+ 或 22.12+ 和 npm；原站采集与浏览器比较另需 `ego-browser` 和参考页面访问权限；许可未声明 |
| `tencent-beacon-frontend` | 需要 Node.js 20.19+ 或 22.12+ 和 npm；浏览器检查需要 `ego-browser` CLI；预览使用本地状态，不连接模型或数据库服务；许可未声明 |
| `compact-floating-panel` | 提供规范与资源；交互和业务逻辑需在宿主项目实现；许可未声明 |
| `archify` | 需要 Node.js 18+；收录版本为固定的开发快照；浏览器与导出行为需单独验证 |

各集合保留自己的来源与许可记录。文件完整性及安装检查不代表 Agent 已发现、运行有效或已获再分发授权。各 Skill 的具体状态见链接指南及 `upstream.json`。

## 文档

- [文档索引](../README.md)
- [快速开始](quickstart.zh-CN.md)与 [Skill 选择指南](../usage/skill-matrix.md)
- [Matt Pocock 个人工作流](../usage/matt-pocock-workflow.md)
- [工作流设计](../design/personal-skill-workflow-design.md)与[项目术语](../../CONTEXT.md)
- [Frontend 领域](../../collections/frontend/README.md)
- [Architecture 领域](../../collections/architecture/README.md)
- [变更记录](../../CHANGELOG.md)

## 仓库结构

```text
collections/
├── mattpocock/             保留上游结构的独立系列
├── frontend/               前端界面 Skills
└── architecture/           架构与技术流程可视化
doc/
├── usage/                  安装、选择与工作流指南
├── zh/                     中文概览和快速开始
└── design/                 本仓库自己的设计决策
AGENTS.md                   面向 Agent 的简短仓库约定
CONTEXT.md                  共用项目术语
scripts/                    可选的 Skill 链接同步脚本
tests/                      仓库和文档检查
```

## 维护者入口

保持上游快照原文不变，更新时同步来源记录与指南。英文 README 和本中文页应在同一次改动中维护。

使用 Python 3.9+ 和 Bash 运行检查：

```bash
python3 -B -m unittest discover -s tests -v
```

测试覆盖元数据、来源完整性、本地链接、安装示例和链接同步。安装与同步检查仅使用临时目录，不操作真实用户安装。收录复制检查、Agent 发现、运行验证和未解决的许可状态应分别报告。修改仓库约定前请阅读[工作流指南](../usage/matt-pocock-workflow.md)。

## 致谢：LINUX DO

感谢 [LINUX DO](https://linux.do/) 社区。社区对证据驱动调试、生产级审查和实际运维经验的分享，为这些技能背后的思路提供了启发。致敬开放分享和技术探索的精神。

## DevOps 部署技能

[DevOps 集合](../../collections/devops/README.md)收录 `deploy-dsh-superagent`。离线辅助脚本需要 Python 3.9+；实际部署需要授权的 Linux/SSH、DSH、平台 CLI 与凭据。技能许可未声明，补丁的上游 MIT 声明已保留；尚未完成全新环境重放和 Agent 发现验证。

`speed-up-github-actions` 用于在不删减必要校验的前提下缩短 GitHub Actions 耗时。需要 Python 3.9+ 和已登录的 `gh`；推送验证分支、修改必需检查需仓库授权。许可未声明；尚未完成完整仓库优化重放和 Agent 发现验证。
