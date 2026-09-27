# Archify

将系统架构、工作流、调用顺序、数据流和状态变化生成可交互的独立 HTML 图。适合技术解释与架构沟通，不替代通用前端组件库。

## 来源

- 上游：`https://github.com/tt-a1i/archify`，原始目录 `archify/`。
- 固定 commit：`9e35d2b0b39b155553ba9fcfe0b4f2a5198dd993`。
- 包版本：`2.17.0-dev.1`，上游 development 通道；不是稳定版承诺。
- 完整保留包内 219 个文件；本 README 与 [upstream.json](upstream.json) 为仓库维护文件。
- [原始 Skill](SKILL.md) · [MIT 许可证](LICENSE) · [第三方声明](THIRD_PARTY_NOTICES.md)。字体和品牌图标具有各自的条款，不能一概视为 MIT。

## 安装

在本仓库根目录运行，复制整个包，已有同名目录时停止：

<!-- install:archify:user -->
```bash
mkdir -p "$HOME/.agents/skills" && mkdir "$HOME/.agents/skills/archify" &&
cp -R collections/architecture/archify/. "$HOME/.agents/skills/archify/"
```

项目级安装时，将命令里的每一处 `$HOME/.agents/skills` 换成目标项目的 `.agents/skills` 路径。客户端发现、刷新和启用步骤见[快速开始](../../../doc/zh/quickstart.zh-CN.md)。不要只复制 `SKILL.md`，也不要将 `collections/architecture/` 整体当成一个 Skill。

## 依赖与边界

- Node.js **18+**，由包内 [package.json](package.json) 声明。
- 核心 CLI 使用包内生成资源；本次基础校验与 HTML 交付示例无需 `npm install`。浏览器交互和图片、视频导出需额外运行验收。
- 保留的 `package.json` 含上游开发脚本，部分依赖上游仓库根目录的 `scripts/`、`viewer/` 等。本快照不是整个开发仓库，不在这里执行完整 `npm test` 或资源重建；开发上游本身应使用完整仓库。
- 原始 Skill 要求候选图建立后运行更新检查器，该检查器可能联网和写入用户缓存。本次未执行它；检查更新不代表允许自动替换本仓库固定快照。

## 使用与验证

客户端显式选择 `archify` 后，可提出：“绘制 Browser → API → Redis 的请求流程，缓存未命中时查询 PostgreSQL 并回填。先校验，再交付 HTML。”架构必须反映真实代码时，应给出项目范围并检查证据。

在安装目录执行以下命令，可验证包内序列图示例，不会打开浏览器：

```bash
node bin/archify.mjs validate sequence examples/cache-miss-request.sequence.json --json
```

CLI 交付使用 `node bin/archify.mjs deliver <type> <input.json> <output.html> --json`。具体图类型、质量条件与诊断处理以 [SKILL.md](SKILL.md) 为准，不把基础校验通过描述为所有输出质量均通过。

本次收录验证：原文件逐字节对比、整个快照摘要、隔离目录安装，以及包内序列图的 CLI 校验与 HTML 交付。未验证：各客户端发现、浏览器交互、所有图类型和全部导出格式。

## 维护

更新时选择明确 commit，先比较上游变化，再替换完整 `archify/` 包。同步来源版本、关键文件清单、全包文件数量与 SHA-256 摘要；保留许可证和第三方声明。不要手改快照内部文件来适配本仓库。

[架构领域](../README.md) · [Skill 选择指南](../../../doc/usage/skill-matrix.md) · [首页](../../../README.md)
