---
name: bytedance-oceanengine-frontend
description: 巨量引擎（OceanEngine）设计规范与可跨项目复用的 React + Tailwind 模板。新建或调整页面标题、标签页、小标题、说明、表格、指标卡、环比趋势、展开收起、选择列、按钮、下拉操作、搜索、单选、多选、级联筛选、背景或选择弹窗时使用；按需读取 references，复用 templates，并用 scripts 与参考截图验证。
---

# 巨量引擎前端规范

本 Skill 目录包含完整的组件规范、模板、参考截图、预览与验证脚本。以下路径均相对于本目录；预览与类型检查使用本目录的依赖和锁文件。

字体继承项目 `font-sans`；其它尺寸、颜色、圆角、状态尽量与参考一致。优先改现有公共组件，避免同一项目出现多套按钮、浮层或图表依赖。不得破坏原有业务行为。

## 按需读取

| 组件 | Reference | Template |
|---|---|---|
| 产品 / 默认 / 连体切换 Tab | [tabs.md](references/tabs.md) | `ProductTabs` / `LineTabs` / `SwitchTabs` |
| 卡片内小标题 / 描述 / 了解更多 / 悬停说明 | [section-header.md](references/section-header.md) | `SectionHeader` / `HintText` |
| 页面标题栏 / 页面背景 / 筛选栏 / 内容容器 | [surfaces.md](references/surfaces.md) | `SurfaceLayout` |
| 表格 / 合计 / 排序 / 分页 | [data-table.md](references/data-table.md) | `DataTable` |
| 指标卡 / 环比 / 双曲线 / 展开收起 | [metrics.md](references/metrics.md) | `MetricOverview` / `MetricCard` / `TrendChart` |
| 选择列 / 勾选 / 已选排序 | [column-chooser.md](references/column-chooser.md) | `ColumnChooserDialog` |
| 按钮 / 搜索 / 下拉操作 | [controls.md](references/controls.md) | `ControlButton` / `OutlineButton` / `DropdownButton` / `SearchFilter` |
| 单选 / 多选 / 类型级联 / 已选标签 | [filters.md](references/filters.md) | `FilterSelect` / `MultiFilterSelect` / `CascadingFilter` |
| 弹窗 / 分段 Tab / 提示条 / 选择列表 | [selection-dialog.md](references/selection-dialog.md) | `SelectionDialog` / `SegmentedTabs` / `NoticeBanner` |

模板都在 `templates/*.tsx`，各规范内附原站截图。不要一次加载全部 Reference。

## 工作步骤

1. 读取相关 Reference 和截图；优先复用现有组件，模板作为可控源码参考。模板跨文件依赖一起复制。
2. 保留 `data-ui` / `data-ui-part` 作为可选验证锚点；实际业务数据由调用方传入，不复制原站组织、指标值或品牌资源。
3. 在 Skill 根目录执行 `npm ci --ignore-scripts` 安装独立预览及类型检查依赖，然后 `npm run gallery`。访问 `http://127.0.0.1:5191`；`?dialog=1` 可直接看选择弹窗，页面下方可操作素材归属 Tab 与三个筛选。预览不修改业务页面。
4. `npm run check` 检查模板及预览页类型。`bash scripts/verify.sh http://127.0.0.1:5191 --output /tmp/frontend-verify [组件名…]` 比较明确列出的属性，并生成截图与报告。缺失或不一致必须返回非零。
5. 目视对照 Reference 与本地截图；检查悬停、键盘、滚动和窄屏。程序比较不能替代视觉检查。

## 维护位置

| 路径 | 职责 |
|---|---|
| `references/*.md` | 设计规则、规格表、适用场景、已知差异 |
| `references/shots/*.png` | 原站截图，默认与交互态分开 |
| `references/specs/*.json` | 原站计算样式、来源、采集状态 |
| `references/capture.json` | 原站页面、选择器与采集交互 |
| `references/verify.json` | 本地目标、交互步骤、每个部位要比较的属性 |
| `references/overrides.json` | 有原因的显式差异；原因必须写在对应 Reference，不能为通过而改基准 |
| `templates/` | React + Tailwind 源码；Base UI 负责浮层、键盘与焦点，Lucide 负责图标，已选排序复用现有 Motion |
| `gallery/` | 隔离的可交互组件夹具；ECharts 6.0.0 用于趋势，使用技能目录内的 React，预览不依赖业务仓库 |
| `scripts/` | 采集、比较、类型检查；`node scripts/check-scripts.mjs` 离线检查失败路径 |

## 增量补充

新增组件时：在 `capture.json` 登记来源、`root`、`parts` 和 `steps`；运行 `bash scripts/capture.sh <名称>` 生成原站 spec + screenshot；写对应 Reference 和 Template；在 `verify.json` 列出稳定且有意义的属性，最后加入本页索引。

采集与浏览器样式比较需要可用的 `ego-browser` CLI；类型检查和离线脚本检查无需浏览器。CLI 自建任务空间并在 finally 释放；已有任务内可调用 MJS 的 `main({taskSpaceId, ...})` 复用空间，由调用方最终释放。交互脚本支持 click / hover / wait / pause / scroll / move / fill / press，以及幂等 `check` 和已选项 `drag`。指标采集固定为 2026-10-28，日期超出默认日历月份后需更新日期导航步骤，不能把“今日无数据”当组件缺失。数据图表规范见 `references/metrics.md`，覆盖浅色单指标及同指标本期 / 上期对照。

预览与类型检查使用本目录的独立依赖。模板的 `cn.ts` 使用 clsx + tailwind-merge；接入业务时优先复用宿主已有工具与依赖。`node_modules`、运行输出和本地配置不提交。
