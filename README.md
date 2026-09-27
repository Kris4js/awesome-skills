# Awesome Skills

以**系列 + 工程领域**组织的 Agent Skill 仓库：Matt Pocock 保留独立系列，其余 Skills 按实际用途归类。每个 `SKILL.md` 所在目录才是独立 Skill，不把集合合并成一个大 Skill。

## 按场景选择

| 场景 | 入口 | 状态 |
| --- | --- | --- |
| 工程开发、TDD、审查、交接与生产力 | [Matt Pocock 系列](collections/mattpocock/README.md) | 38 个 Skill，固定版本，MIT |
| 前端界面、AI 聊天、RAG 与 Canvas 装配 | [Frontend 领域](collections/frontend/README.md) | `awesome-ui-kit` 已收录，外部依赖与授权状态见说明 |

## 目录约定

```text
collections/
  mattpocock/                  知名系列，保留上游内部结构
    README.md
    upstream.json             系列级来源记录（kind: series）
    LICENSE
    skills/
  frontend/                   工程领域，不按作者划分
    README.md
    awesome-ui-kit/
      README.md               使用入口、依赖与验证状态
      upstream.json           Skill 级来源记录（kind: skill）
      NOTICE.md               未找到许可证时的状态说明，不是授权
      SKILL.md
      references/
tests/                        仓库自身的离线基础检查
```

先按 `frontend` 归类，不提前细分 `ui/ux`。新增领域只在实际收录时创建。不同集合允许同名 Skill，安装时自行避免冲突；同一集合内名称必须唯一。

## 使用

从入口选择 Skill，先阅读授权状态和依赖说明。授权与依赖确认后，按目标 Agent 的要求复制 Skill 的**完整目录**并保留适用许可证与来源记录。收录不等于安装，克隆仓库不会修改全局 Agent 配置。

- Matt Pocock 的固定快照复制示例见 [系列说明](collections/mattpocock/README.md)。
- Awesome UI Kit 的组件库依赖、版本与授权待确认事项见 [使用说明](collections/frontend/awesome-ui-kit/README.md)。

本仓库不保证所有 Agent 都会自动发现嵌套目录，也不把基础检查通过视为 Skill 的实际运行效果已经验证。

## 验证

只需 Python 3.9+，不需要第三方依赖：

```bash
python3 -B -m unittest discover -s tests -v
```

检查系列/领域布局、来源版本、授权状态记录、Skill 清单完整性、声明的配套文件、基本元数据、集合内名称唯一性、依赖记录和本仓库导航。不联网验证依赖，不执行 Skill，不验证完整 YAML 语法或模型任务效果。

## 维护

- 上游原文件不改写，本仓库说明和来源清单单独维护。
- `upstream.json` 的 `source_path` 表示上游仓库中的原始目录；`skills`、可选 `files` 和许可证路径相对于该清单所在目录。
- 系列使用系列级清单；领域下每个 Skill 各自记录来源、固定 commit、文件清单与外部依赖，不能把不同作者的内容挂在同一上游记录下。
- 更新时审查差异，再替换快照、更新清单与数量说明、运行测试并记录变更。不自动跟随上游分支。
- 找到适用许可证时保留原文；未找到时记录 `license: null`、`license_status: not-found` 并附 NOTICE，不猜测授权，不套用其他集合的许可证。对外发布前需确认待定项。
- 测试通过只表示记录与文件符合仓库约定，不表示授权确认或运行验收通过。

变更记录见 [CHANGELOG](CHANGELOG.md)。
