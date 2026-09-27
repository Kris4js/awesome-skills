# Awesome UI Kit

**领域：frontend · 用途：AI 界面组件装配。** 用于聊天界面、RAG 引用、Agent 工具调用展示和 Canvas / Artifacts 页面；不是通用 UX 研究方法，也不包含组件源码。

## 内容入口

- [原始 Skill 指令](SKILL.md)
- [组件路径清单](references/component-inventory.md)
- [页面装配示例](references/page-recipes.md)
- [固定版本与依赖记录](upstream.json)
- [来源与授权状态](NOTICE.md)

上游 `dengyie/awesome-skills` 的 `awesome-ui-kit/`，固定于 `580de912652a2cb912856cc5414f9fa05ef869a8`。三个原始文件原样保存；本 README、NOTICE 和来源清单由本仓库维护。

**状态：已收录；授权待确认；未安装、未验证页面运行效果。** 未发现适用于该 Skill 的上游许可证，不标记为 MIT，发布或再分发前应先完成授权确认。详情见 NOTICE。

## 外部依赖

| 项目 | 记录 |
| --- | --- |
| 组件库 | `https://github.com/dengyie/awesome-ui` |
| 核查版本 | `79a7f8186fd33cd7354f7d30534b889d50d83e98` |
| 技术栈 | 按目标项目选择 `react/`、`vue/` 或 `vanilla/` |
| 索引 | 组件库根目录的 `llms.txt`、`llms-full.txt` |
| 本次核查 | 三种技术栈下清单中的九个组件路径均存在；未验证 Props 兼容性与运行效果 |
| 授权 | 未找到明确许可证，未复制组件库源码 |

原始参考文档中的远程索引使用 `main`，会随上游变化。需要复现时，应读取上表 commit 对应的文件，而不是直接跟随 `main`。依赖版本记录仅用于复现路径核查，不代表兼容性保证。

## 使用边界

1. 先确认 Skill 和组件库授权，再决定使用或分发方式。
2. 确认目标项目技术栈及 Tailwind 等组件所需环境，准备对应版本的 `awesome-ui` 源码。
3. 阅读原始 Skill 与两份参考文档；Skill 需要组件库配合，不能只凭本目录生成可运行页面。
4. 授权与依赖确认后，安装时保留整个 Skill 目录及来源说明；不要只取 `SKILL.md`。
5. 组件复制后还需在目标项目验证样式、交互、流式行为和预览隔离；本仓库基础测试不覆盖这些能力。

本仓库不自动下载运行依赖，不执行组件库脚本，不修改全局 Agent 配置。

## 维护

更新时同时检查 Skill 与组件库版本差异。保留三个上游原文件，更新 `upstream.json`、本说明和根目录 CHANGELOG，再运行仓库测试；不把其他集合的许可证用于此目录。

[返回前端领域](../README.md) · [返回仓库首页](../../../README.md)
