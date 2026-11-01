---
name: speed-up-github-actions
description: 在不删减必要测试和功能校验的前提下，测量并缩短仓库 GitHub Actions CI 耗时。先用 gh 拉取近期运行，把每个 job 拆成排队、准备、执行三段，再按证据优化并发取消、路径过滤、缓存、预编译工具、并行与分片、macOS 配额和重复工作，推送验证后给出前后对比。适用于“CI 太慢”“Actions 提速”“优化 workflow 耗时”；不用于新建 CI 或排查单个测试失败。
---

# GitHub Actions 提速

目标：PR 从推送到全部必需检查出结果的墙钟时间尽量短，同时 **检查集合不缩水**。每项改动都要能指回测量数据；没有数据支撑的“优化”不做。

## 1. 先测量，再动手

```bash
python3 scripts/ci_timing.py fetch --repo OWNER/REPO --limit 50 --output ci-before.json
python3 scripts/ci_timing.py report ci-before.json
```

脚本把每个 job 拆成 **排队**（created→started）、**准备**（checkout、setup-*、缓存、依赖安装、工具下载、post 清理）、**执行**（其余步骤）。步骤名不规范时用 `--setup-pattern` 补充正则。重点看：

| 现象 | 通常的原因 |
| --- | --- |
| 排队长，集中在 macOS | 账号级 macOS 并发上限被占满 |
| 准备 > 执行 | 缓存未命中/未配置、现场编译工具、依赖安装层失效 |
| 同一 PR 多个 run 叠在一起 | 缺少 concurrency 取消 |
| workflow 总时长 ≈ 各 job 之和 | `needs` 串行了本可并行的 job |
| 一个 job 远长于其他 | 最长测试集未分片 |

同时记录当前 **检查清单**：每个 workflow 跑了哪些命令（测试、lint、格式、审计、构建、平台矩阵）。它是改完后“没有减少校验”的对照基准。

## 2. 按证据逐项优化

YAML 写法与陷阱见 [优化手册](references/playbook.md)。按收益从高到低：

1. **取消过时运行**：PR 用 `concurrency` + `cancel-in-progress`；main 的 group 必须每次提交唯一，否则排队中的旧提交仍会被替换，发版提交不能保证完整跑过。
2. **跳过纯文档提交**：`paths-ignore` 过滤 README/docs。被设为 **必需检查** 的 workflow 一旦被路径过滤跳过，PR 会永远 Pending；这类 workflow 改用 job 级变更检测 + 汇总 job，只把汇总 job 设为必需。
3. **用 setup 类 action 自带缓存**：`setup-node` 设 `cache`，`setup-go` 默认开启，`setup-python` 设 `cache`，Rust 用 `Swatinem/rust-cache`。仓库默认缓存上限 10 GB，超出按最久未用淘汰；只缓存会被复用的内容，PR 分支通常不写缓存。
4. **本地连续构建两次**：第二次应接近零耗时。不是的话，必有输入每次都在变：Dockerfile 在装依赖前 `COPY . .`、`build.rs` 的 `rerun-if-changed` 指向不存在的文件、构建写时间戳或生成文件进源码树。
5. **工具下载预编译版本**：不要 `go install`、`cargo install`、源码编译 CLI；用官方 action、`taiki-e/install-action` 或带校验的 release 下载，版本固定。
6. **并行与分片**：删掉不传产物/输出的 `needs`；最长测试集用 matrix 分片到多台机器。
7. **macOS 只跑必须在 macOS 跑的**：免费账号 macOS 同时最多 5 个 job，所有 workflow 共享。格式化、lint、依赖审计、与平台无关的单测移到 Ubuntu。
8. **去掉重复和多余工作**：同一检查只在一个 job 跑；只构建前端的 job 不恢复 Rust 缓存、不装 Rust 工具链；不需要完整历史就不要 `fetch-depth: 0`。

不改测试本身的范围、平台矩阵或断言来换速度。确需取舍（例如把某平台降为仅 main 运行）时，列出影响并让用户决定。

## 3. 推送验证并迭代

- 改动推到 **非默认分支** 并开 PR 触发 CI；推送 main、修改分支保护的必需检查都需要用户明确授权。
- 每轮推送后再 `fetch`（可用 `--branch` 限定该分支），与基线 `report ci-after.json --baseline ci-before.json` 对比；冷缓存首次运行偏慢，至少看第二次同类运行。
- 根据新数据再查漏补缺，直到剩余耗时主要是测试本身执行。

## 交付

| 内容 | 要求 |
| --- | --- |
| 前后对比表 | 各 workflow 墙钟中位数，各 job 排队/准备/执行中位数，样本数 |
| 检查清单对照 | 改前改后的测试、lint、构建、平台矩阵一一对应；任何变化单独说明 |
| 改动列表 | 每项改动对应的测量依据 |
| 未验证项 | 仅 main 触发的路径、定时任务、发版 workflow 等本轮未实际跑到的部分 |
| 需用户操作 | 必需检查改名、分支保护、付费 runner 等 |

样本少或冷缓存时，如实标注，不把单次结果说成稳定提升。
