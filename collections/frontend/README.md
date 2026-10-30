# Frontend · 前端开发与界面装配

按工程领域收录前端 Skills，不按作者拆分。当前不再细分 `ui/`、`ux/`；每个 Skill 使用自己的来源与授权记录，避免不同上游混用许可证。

| Skill | 适用场景 | 状态 |
| --- | --- | --- |
| [awesome-ui-kit](awesome-ui-kit/README.md) | AI 聊天、RAG、工具调用展示、Canvas 页面组件装配 | 固定版本已收录；依赖外部组件库；授权待确认 |
| [bytedance-oceanengine-frontend](bytedance-oceanengine-frontend/README.md) | 巨量引擎风格 React 组件、独立预览与样式验证 | 独立 Skill，含组件规范、模板与验证脚本；许可未声明 |
| [compact-floating-panel](compact-floating-panel/README.md) | 网页内紧凑浮窗、拖动与收起恢复规范、组件样式 | 个人维护的本地内容已收录；交互需实现；许可未声明 |

## 收录约定

- 每个 Skill 直接放在 `<skill-name>/`，保留 `SKILL.md` 与配套参考文件。
- 每个目录维护 `README.md` 和 `upstream.json`，记录上游仓库、原始路径、commit、文件清单及外部依赖。个人维护的本地来源使用 `source_type: local`，记录维护者、原目录与逐文件 SHA-256；无 Git 来源时 repository/commit 为 null，不虚构版本。
- 有明确许可证时保留原文件；未找到时如实记录并附 `NOTICE.md`，不猜测授权。
- README 是使用入口；收录状态、依赖准备与运行验证状态必须分开说明。

[返回仓库首页](../../README.md)
