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

例如，在仓库根目录将 `tdd` 复制到自行确认的目标目录：

```bash
# 替换为目标 Agent 支持的 Skills 目录；不要直接运行占位路径。
DEST="/absolute/path/to/agent/skills"
mkdir -p "$DEST"
# 已有同名目录时停止，避免覆盖已有修改。
if [ -e "$DEST/tdd" ] || [ -L "$DEST/tdd" ]; then
  printf '%s\n' '目标 tdd 已存在，请先检查差异。' >&2
else
  cp -R collections/mattpocock/skills/engineering/tdd "$DEST/tdd"
  cp collections/mattpocock/LICENSE "$DEST/tdd/LICENSE.mattpocock"
fi
```

这里仅提供复制示例，本仓库不会自动安装或运行 Skill。部分 Skills 会调用其他 Skills、命令行工具，或要求目标项目先完成配置；使用前阅读对应说明。`setup-matt-pocock-skills` 应在实际使用这些工程 Skills 的目标项目运行，收录文件本身不代表本仓库已经完成其配置。

## 更新约定

手动选择上游 commit，审查差异后替换 `skills/` 和许可证，并更新来源清单、数量说明及根目录变更记录。保留上游文件原文；不自动跟随 `main`。此目录不是完整上游仓库，若需上游项目文档或插件安装方式，请在上游查看对应版本。

[返回仓库首页](../../README.md)
