# 快速开始

[English](../usage/quickstart.md) · [Skill 选择指南](../usage/skill-matrix.md) · [文档索引](../README.md)

## 1. 获取文件

准备 Git、Bash、GitHub CLI（`gh`）和已安装的 Codex 客户端。Python 3.9+ 仅用于运行本仓库检查，复制 Skill 不需要 Python。通过 GitHub CLI 登录有权限的账号后，克隆这个私有仓库：

```bash
gh repo clone Kris4js/awesome-skills
cd awesome-skills
```

已有克隆则直接使用。下面所有安装命令都在**本仓库克隆的根目录**运行，而不是 `doc/` 下。`collections/` 保存固定版本快照，克隆不等于安装。

## 2. 选择一个 Skill 和一个安装范围

测试优先的编码任务可以先用 `tdd`，其他任务参考 [Skill 选择指南](../usage/skill-matrix.md)。安装的是包含 `SKILL.md` 的完整目录，包括配套文件。

Codex [官方文档](https://developers.openai.com/codex/skills)规定用户级路径为 `$HOME/.agents/skills`，项目级路径为项目中的 `.agents/skills`。两种范围选择一个即可，避免重复名称。以下是 Codex 的路径，其他 Agent 请以各自文档为准。

### 用户级安装

跨项目可用。示例复制 `tdd`、系列许可证和固定版本来源记录。两个 `test` 检查会拒绝已存在的目标，包括失效软链接。

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

### 项目级安装

选择下面这个替代方案，让 `tdd` 在**当前克隆项目**可用。若要安装到其他项目，只把 `dest` 改为目标项目 `.agents/skills` 的绝对路径；执行命令时仍留在本仓库根目录，以便源文件路径正确。

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

在这个收藏仓库中，安装副本是本地工作文件，不是第二套上游快照。暂存前检查 `git status`；其他目标项目是否提交自己的安装副本，应单独决定。

## 3. 确认发现并尝试一个小任务

- 用户级：确认 `$HOME/.agents/skills/tdd/SKILL.md` 存在。
- 项目级：确认目标项目中存在 `.agents/skills/tdd/SKILL.md`，并在目标项目启动 Codex。
- Codex 通常自动发现变更；未显示时重启，然后输入 `$tdd` 选择 Skill。
- 可尝试：“$tdd 为这个具体 bug 增加回归测试。先确认测试边界，再做最小修复。”

收录的 `tdd` 在接口本身不明确时会调用 `codebase-design`，并将后续审查指向 `code-review`。任务进入这些阶段时再阅读、安装对应依赖；这个单 Skill 示例没有安装完整工作流。

复制成功、Agent 发现成功、实际任务有效是三个不同结果。仓库测试只在隔离目录验证复制命令，不启动 Codex。在本项目如何挑选首个任务，见[个人工作流](../usage/matt-pocock-workflow.md)。

## 4. 有意识地更新

安装副本与仓库快照相互独立，更新克隆不会自动更新安装。先比较源目录与安装目录，保存本地改动，再决定替换；同时刷新 `LICENSE.mattpocock` 与 `UPSTREAM.mattpocock.json`。来源记录描述的是整个系列，不表示其中全部 Skill 都已安装。

## 排错

| 现象 | 检查方式 |
| --- | --- |
| 复制前就停止 | 目标已存在，可能是失效软链接。先检查内容，不要直接删除。 |
| 建立目标后复制失败 | 复制不是事务操作。检查未完成的安装，保存本地改动并将其移到备份位置，再重试；使用前确认许可证和来源记录完整。 |
| 找不到源文件 | 确认当前工作目录是克隆根目录，并核对选择指南中的源目录。 |
| Codex 看不到 Skill | 核对安装范围、`SKILL.md` 的实际位置和禁用配置；必要时重启。 |
| 出现重复条目 | 查看用户级与项目级是否同时存在同名 Skill；合并前保存本地改动。 |
| Skill 要求其他 Skills 或项目配置 | 阅读其前置条件；复制一个 Skill 不等于已完成整套工程工作流配置。 |
| `awesome-ui-kit` 无法直接生成可运行页面 | 本仓库未包含 `awesome-ui` 组件库，先阅读[依赖与授权说明](../../collections/frontend/awesome-ui-kit/README.md)。 |

## 来源与验证

安装路径和重新加载说明于 2026-09-27 核对 [Codex 官方文档](https://developers.openai.com/codex/skills)。命令面向 POSIX 风格环境下的 Bash，未声明支持 PowerShell。

运行 `python3 -B -m unittest discover -s tests -v` 可检查文档和复制示例，不会触碰真实用户安装目录。
