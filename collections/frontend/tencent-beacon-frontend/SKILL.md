---
name: tencent-beacon-frontend
description: 腾讯灯塔风格的 React 数据工作台界面设计与可复用组件。构建或调整导航侧栏、对话输入区、可调整分栏、文件页签、数据集列表、来源筛选、MySQL 数据连接表单和空态详情时使用；按需读取规范，复用模板并运行独立预览。
---

# 腾讯灯塔前端规范

本目录是完整、独立的 Skill，包含组件源码、样式、参考截图、计算样式和交互验证脚本。路径均相对于本目录。先按当前任务读取相关规范，不要一次加载全部截图。

| 任务 | 规范 | 模板 |
| --- | --- | --- |
| 整页布局、侧栏、分栏与窄屏 | [workbench.md](references/workbench.md) | `templates/BeaconWorkbench.tsx`、`templates/beacon.css` |
| 对话输入、建议、附件、模型与模式选择 | [composer.md](references/composer.md) | `templates/BeaconComposer.tsx` |
| 数据页签、列表、筛选、详情空态 | [data-workspace.md](references/data-workspace.md) | `templates/BeaconDataWorkspace.tsx`、`templates/data.ts` |
| 通用表单填写页面的设计引用 | [form-design.md](references/form-design.md) | `templates/BeaconConnectionForm.tsx`、`templates/beacon.css` |
| MySQL 数据连接、协议、凭据与管理员表单 | [connection-form.md](references/connection-form.md) | `templates/BeaconConnectionForm.tsx` |
| 菜单、弹窗、键盘与状态 | [interactions.md](references/interactions.md) | `templates/WorkbenchMenu.tsx`、`templates/WorkbenchDialog.tsx` |

## 实现

1. 对照相关 Reference 与截图选择布局和组件，复用目标项目已有的兼容组件与依赖。采用模板时一起保留相对导入的工具、样式及必要资源。
2. 按原页实测样式复刻，不能自行统一字号、移除阴影、替换品牌图标或改变控件形态。MySQL 表单使用 11 / 12 / 13px，基准见 `references/specs/connection-form.json`；对话区文字以 `references/specs/chat-typography.json` 为准；其余区域仍有待校准的初版差异。
3. 状态由 React 管理，菜单和弹窗由 Base UI 管理焦点及键盘，可调整分栏使用 react-resizable-panels，操作图标使用 Lucide，数据库品牌使用 assets 中对应 SVG。不要为局部页面增加第二套组件库。
4. 输入区的 `onSend` 接收文本、模型、模式、技能、风格及附件名称。实际模型、数据服务和文件上传由目标应用连接；本地预览只保留当前页面状态，不发起这些请求。
5. 桌面三栏布局保持各区独立滚动。窄屏切换为“对话 / 数据”视图；保留所有操作入口和可访问名称。

## 预览与验证

Node.js 20.19+ 或 22.12+，以及 npm。在 Skill 根目录执行：

```bash
npm ci --ignore-scripts
npm run check
npm run gallery
```

访问 `http://127.0.0.1:5192`。`npm run build` 检查类型并生成生产构建。

`http://127.0.0.1:5192/?view=mysql` 直接打开 MySQL 连接表单。

有可用的 `ego-browser` CLI 时，用 [scripts/verify.mjs](scripts/verify.mjs) 验证本地页面。调用方法见 [README.md](README.md)。脚本只允许 localhost 地址，覆盖空态、菜单焦点、筛选、新建本地数据集、页签键盘、侧栏、铺满、输入与窄屏，输出截图和 JSON 结果；不会在参考站点创建数据。

## 复刻边界

页面规格包含数据工作台新建页、空数据集及 MySQL 连接表单。网页实测、截图测量和模板补充的本地演示行为分别记录在 Reference 中，不把示例数据表、连接测试反馈、模拟消息或其他功能入口当作真实服务实现。

品牌与插图资源仅用于复刻对照。制作其他产品时替换品牌资源和文案，遵循 [NOTICE.md](NOTICE.md) 中的权利说明。

表单修改后运行 `scripts/verify.mjs`，其中 `scripts/form-fidelity.mjs` 对照采集基准检查样式、布局和焦点态。功能检查通过不能替代原页视觉比对。
