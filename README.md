# Awesome Skills

按来源整理的 Agent Skill 仓库。集合是组织单位，每个 `SKILL.md` 所在目录才是独立 Skill；本仓库不会把整套集合合并为一个 Skill。

## 集合

| 集合 | 内容 | 使用说明 |
| --- | --- | --- |
| Matt Pocock | 工程与生产力等 38 个 Skill，固定版本快照 | [集合入口](collections/mattpocock/README.md) |

## 目录约定

```text
collections/
  <source>/
    README.md       来源、使用方式与注意事项
    upstream.json   上游仓库、固定 commit、Skill 清单
    LICENSE         上游许可证
    skills/         原样保留上游 Skill 结构与配套文件
tests/              仓库自身的基础检查
```

仅按来源增加一层，不统一改写上游分类。不同集合允许有同名 Skill，安装时需自行避免冲突。

## 使用

从集合入口选择 Skill，阅读其指令和依赖，再将该 Skill 的**完整目录**复制到目标 Agent 支持的 Skills 目录。收录不等于安装；克隆本仓库不会修改全局 Agent 配置。

本仓库不保证所有 Agent 都会自动发现嵌套的集合目录。具体示例见 [Matt Pocock 集合说明](collections/mattpocock/README.md)。

## 验证

只需 Python 3.9+，不需要第三方依赖：

```bash
python3 -B -m unittest discover -s tests -v
```

检查来源信息、Skill 清单、基本元数据、集合内名称唯一性和本仓库首页导航。不执行 Skill，也不验证完整 YAML 语法、外部链接或模型任务效果。

## 维护

- 上游文件保留原样，集合说明和来源信息由本仓库维护。
- 更新时先检查上游差异，再替换快照、更新 `upstream.json` 和数量说明，运行测试后记录变更。
- 不自动追踪上游分支，不附带上游开发环境或自动执行其脚本。
- 第三方内容遵循各集合内的许可证；不将上游授权扩大解释为本仓库其他内容的授权。

变更记录见 [CHANGELOG](CHANGELOG.md)。
