# 巨量引擎前端规范

独立的巨量引擎风格前端 Skill，提供 React + Tailwind 组件规范与可控源码，覆盖标签页、表格、指标趋势、筛选、选择列和弹窗。组件模板、参考截图、交互预览与验证脚本均位于本目录。

| 入口 | 内容 |
| --- | --- |
| [SKILL.md](SKILL.md) | 按组件选择 Reference、Template 与验证流程 |
| [templates](templates/) | React 组件源码与 cn 工具 |
| [references](references/) | 原站规范、截图、采集配置与计算样式 |
| [gallery](gallery/) | 可独立启动的交互预览 |
| [scripts](scripts/) | 类型检查、参考采集与样式比较 |
| [NOTICE.md](NOTICE.md) | 许可与第三方内容说明 |

## 使用

1. 阅读 [SKILL.md](SKILL.md)，按组件选择相关 Reference 和截图。
2. 按规范调整目标页面；采用模板时保留所需的跨文件依赖，由调用方传入业务数据与状态。
3. 使用本目录的预览确认组件行为，再在目标页面检查样式、键盘操作、滚动与窄屏布局。

已有公共组件、样式工具或兼容依赖时优先复用，保持目标项目的组件与依赖一致。

## 独立预览

需要支持 Vite 8 的 Node.js 环境（20.19+ 或 22.12+）与 npm。在本 Skill 目录执行：

```bash
npm ci --ignore-scripts
npm run check
npm run check:scripts
npm run gallery
```

预览地址为 `http://127.0.0.1:5191`，`?dialog=1` 直接打开选择弹窗。预览与类型检查使用本目录的 `package.json` 和锁文件，不依赖外部业务项目。组件使用 React、Base UI、Lucide、Motion、ECharts、Tailwind、clsx 与 tailwind-merge。

## 验证与参考采集

在本 Skill 目录执行：

| 操作 | 命令 | 条件 |
| --- | --- | --- |
| 模板与预览类型检查 | `npm run check` | 已安装本目录依赖 |
| 离线脚本检查 | `npm run check:scripts` | 已安装本目录依赖，无需浏览器 |
| 本地样式比较 | `bash scripts/verify.sh http://127.0.0.1:5191 --output /tmp/frontend-verify` | 预览已启动，`ego-browser` CLI 可用 |
| 更新指定组件的参考 | `bash scripts/capture.sh <组件名>` | `ego-browser` CLI 可用，可访问配置中的参考页面 |

样式比较按 `references/verify.json` 中列出的属性执行，并输出截图与报告；仍需目视检查交互状态与布局。参考采集的日期导航固定在 2026-10-28，重新采集前需检查日期步骤。

## 许可

此 Skill 尚未声明许可证。参考截图、样式记录和第三方依赖的说明见 [NOTICE.md](NOTICE.md)。
