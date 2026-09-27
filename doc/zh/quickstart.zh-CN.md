# 快速开始

[English](../usage/quickstart.md) · [Skill 选择指南](../usage/skill-matrix.md) · [文档索引](../README.md)

## 1. 获取文件

选择已安装的客户端：**Codex、Pi CLI 或 PI-Desktop**。手动复制示例需要 Git 和 Bash，克隆命令使用 GitHub CLI（`gh`）。使用桌面端流程无需另装 Pi CLI。Python 3.9+ 仅用于仓库检查。登录有权限的 GitHub 账号后克隆这个私有仓库：

```bash
gh repo clone Kris4js/awesome-skills
cd awesome-skills
```

已有克隆则直接使用。下面所有安装命令都在**本仓库克隆的根目录**运行，而不是 `doc/` 下。`collections/` 保存固定版本快照，克隆不等于安装。

## 2. 选择一个 Skill 和一个安装范围

测试优先的编码任务可以先用 `tdd`，其他任务参考 [Skill 选择指南](../usage/skill-matrix.md)。安装的是包含 `SKILL.md` 的完整目录，包括配套文件。

统一使用用户级 `$HOME/.agents/skills` 或目标项目根目录的 `.agents/skills`。[Codex](https://developers.openai.com/codex/skills) 与 [Pi](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md) 都支持这些通用目录。[PI-Desktop 官方指南](https://pi-desktop.app/docs/)的技能界面展示了全局 `.agents/skills` 路径；项目级或旧版本桌面端尤其需要在设置中确认实际发现的目录。选择一个范围、一份副本即可，不必按客户端重复安装。

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
- 项目级：确认目标项目中存在 `.agents/skills/tdd/SKILL.md`，并在客户端打开该项目。

| 客户端 | 刷新 / 启用 | 显式使用 |
| --- | --- | --- |
| Codex | 通常自动发现；未显示时重启。 | 选择 `$tdd` 后描述任务。 |
| Pi CLI | 在目标项目启动 Pi，或在已有会话执行 `/reload`。 | `/skill:tdd 为这个 bug 增加回归测试；先确认测试边界。` |
| PI-Desktop | 选择项目 → 设置 → 技能，确认 `tdd` 已显示，检查来源路径并开启可见性。如果旧会话列表未更新，打开新会话。 | 要求：“处理任务前，先调用 `Skill` 工具，id 为 `tdd`。”以工具结果确认加载成功，不只看 Agent 的文字声明。 |

### PI-Desktop 注意事项

- 桌面端也提供“设置 → 技能 → 添加技能”，可选全局或当前项目。搜索安装可能使用不同的上游版本；需要本仓库固定快照时，使用上面的复制命令。
- 使用当前会话实际暴露的 id。打包技能可能带命名空间；缺少 `tdd` 时应检查设置，不猜 id。
- 上面的 `/reload`、`/skill:tdd` 是 Pi CLI 操作，不保证所有 PI-Desktop 版本接受相同命令；`Skill` 工具是当前 PI-Desktop 会话暴露的加载机制。
- 如果复制的目录未出现在桌面列表中，检查范围、所选项目、应用版本和技能来源配置，再重新打开设置或重启应用。不要反复向不同目录复制同名技能来猜发现路径。

收录的 `tdd` 在接口本身不明确时会调用 `codebase-design`，并将后续审查指向 `code-review`。任务进入这些阶段时再阅读、安装对应依赖；这个单 Skill 示例没有安装完整工作流。

复制成功、Agent 发现成功、实际任务有效是三个不同结果。仓库测试只在隔离目录验证复制命令，不启动 Codex、Pi CLI 或 PI-Desktop。当前会话暴露了 `Skill` 工具，但本次没有在三种客户端安装并运行验证 `tdd`。本项目的实践方式见[个人工作流](../usage/matt-pocock-workflow.md)。

## 4. 有意识地更新

安装副本与仓库快照相互独立，更新克隆不会自动更新安装。先比较源目录与安装目录，保存本地改动，再决定替换；同时刷新 `LICENSE.mattpocock` 与 `UPSTREAM.mattpocock.json`。来源记录描述的是整个系列，不表示其中全部 Skill 都已安装。

README 简短示例在安装的 `tdd` 目录内保留原名 `LICENSE`、`upstream.json`；如果采用该示例，更新这两个文件即可。上面的详细示例使用带来源后缀的文件名，两种方式保留的许可证与来源内容相同。

## 排错

| 现象 | 检查方式 |
| --- | --- |
| 复制前就停止 | 目标已存在，可能是失效软链接。先检查内容，不要直接删除。 |
| 建立目标后复制失败 | 复制不是事务操作。检查未完成的安装，保存本地改动并将其移到备份位置，再重试；使用前确认许可证和来源记录完整。 |
| 找不到源文件 | 确认当前工作目录是克隆根目录，并核对选择指南中的源目录。 |
| Codex 看不到 Skill | 核对安装范围、`SKILL.md` 的实际位置和禁用配置；必要时重启。 |
| Pi CLI / PI-Desktop 看不到 Skill | 核对所选项目、启动诊断或技能设置，以及是否被禁用；按上表中对应客户端的方法刷新。 |
| 出现重复条目 | 查看用户级与项目级是否同时存在同名 Skill；合并前保存本地改动。 |
| Skill 要求其他 Skills 或项目配置 | 阅读其前置条件；复制一个 Skill 不等于已完成整套工程工作流配置。 |
| `awesome-ui-kit` 无法直接生成可运行页面 | 本仓库未包含 `awesome-ui` 组件库，先阅读[依赖与授权说明](../../collections/frontend/awesome-ui-kit/README.md)。 |

## 来源与验证

来源：[Codex Skills](https://developers.openai.com/codex/skills)、[Pi Skills](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/skills.md) 和 [PI-Desktop 技能设置](https://pi-desktop.app/docs/)，核对日期为 2026-09-27。命令面向 POSIX 风格环境下的 Bash，未声明支持 PowerShell。

运行 `python3 -B -m unittest discover -s tests -v` 可检查文档和复制示例，不会触碰真实用户安装目录。
