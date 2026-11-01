# 优化手册

示例中的 action 版本只是写法示意；落地时沿用仓库已用的主版本，或按官方文档确认当前版本。

## 取消过时运行，main 每次提交都完整跑

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.event.pull_request.number || github.run_id }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

- 同一 group 最多一个运行中加一个排队中；更新的运行到达时，**排队中的旧运行总会被取消**，与 `cancel-in-progress` 无关。所以 main 用 `github.run_id` 让每次提交独占 group，不能用 `github.ref`。
- 其他会跑测试的事件（`merge_group`、`push` 到发版分支）按同样原则处理：需要逐提交结果的就不共享 group。

## 跳过纯文档提交，同时不卡住必需检查

非必需 workflow 直接过滤：

```yaml
on:
  pull_request:
    paths-ignore: ['**.md', 'docs/**', 'LICENSE']
  push:
    branches: [main]
    paths-ignore: ['**.md', 'docs/**', 'LICENSE']
```

被设为必需检查的 workflow 若在 workflow 级被跳过，检查会一直 Pending，PR 无法合并。改为 job 级判断，job 被 `if` 跳过时视为通过：

```yaml
jobs:
  changes:
    runs-on: ubuntu-latest
    outputs:
      code: ${{ steps.filter.outputs.code }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            code:
              - '!**.md'
              - '!docs/**'
          predicate-quantifier: every
  test:
    needs: changes
    if: needs.changes.outputs.code == 'true'
    runs-on: ubuntu-latest
    steps: [...]
  ci-ok:
    needs: [changes, test, lint]  # 含 changes：它失败时下游被跳过，不能算通过
    if: always()
    runs-on: ubuntu-latest
    steps:
      - run: exit 1
        if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')
```

只把 `ci-ok` 设为必需检查。修改必需检查名称要由仓库管理员在分支保护或 ruleset 中操作，提前告知用户。

## 缓存

| 生态 | 写法 | 注意 |
| --- | --- | --- |
| Node | `actions/setup-node` 的 `cache: npm\|pnpm\|yarn` | pnpm 需先运行 `pnpm/action-setup`；缓存的是包管理器存储，不是 `node_modules` |
| Go | `actions/setup-go` v4 起默认缓存模块和构建缓存 | 多个 `go.sum` 时设 `cache-dependency-path` |
| Python | `actions/setup-python` 的 `cache: pip\|poetry\|pipenv` | 依赖文件不在根目录时设 `cache-dependency-path` |
| Rust | `Swatinem/rust-cache@v2` | 设 `save-if: ${{ github.ref == 'refs/heads/main' }}`；矩阵内用 `key` 区分目标；只构建前端的 job 不要用它 |
| Docker | `docker/build-push-action` 配 `cache-from/cache-to: type=gha` | 体积大，按 `scope` 区分镜像，注意挤占 10 GB |

- 缓存按分支隔离：PR 能读 base 分支（main）写的缓存，其他 PR 读不到这个 PR 写的缓存。PR 上写缓存多半是浪费配额，并会挤掉 main 的有用缓存。
- 用 `gh cache list --sort size_in_bytes` 查看占用；命中率看各 job 的 cache restore 步骤日志。
- 只恢复 job 真正用到的缓存，大缓存的下载解压本身也要时间。

## 构建可重复性：连续构建两次

| 症状 | 检查与修复 |
| --- | --- |
| Docker 每次都重装依赖 | 先 `COPY` 清单与锁文件、安装依赖，再 `COPY` 源码；补 `.dockerignore`（`.git`、`node_modules`、`target`） |
| Cargo 每次重跑 build.rs | `rerun-if-changed` 路径不存在会导致每次都重跑；改成真实输入或删除 |
| 前端/生成代码每次重建 | 生成器写入时间戳、随机值或绝对路径；产物写回被监视的源码目录 |
| Make/脚本每次全量 | 目标文件名与实际产物不一致，或依赖了不存在的文件 |

CI 里也可以加一步“二次构建”测一下，不过它本身也耗时间，排查完就去掉。

## 预编译工具

| 不要 | 改为 |
| --- | --- |
| `cargo install cargo-nextest` 等 | `taiki-e/install-action` 或 `cargo-binstall`，固定版本 |
| `go install ...golangci-lint` | `golangci/golangci-lint-action`，或下载 release 并校验 checksum |
| 每次 `npm i -g` 全局工具 | 放进 devDependencies 随锁文件缓存，或用 `npx` 固定版本 |
| apt 装大量包 | 确认是否 runner 预装；否则只装必要包并加 `--no-install-recommends` |

## 并行与分片

- `needs` 只保留真正消费 `outputs` 或 artifact 的依赖；lint、单测、构建通常互不依赖。
- 最长的测试集用矩阵分片：

```yaml
strategy:
  fail-fast: false
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: cargo nextest run --partition count:${{ matrix.shard }}/4
  # npx jest --shard=${{ matrix.shard }}/4
  # npx playwright test --shard=${{ matrix.shard }}/4
  # pytest --splits 4 --group ${{ matrix.shard }}  (pytest-split)
```

- 分片数以“每片执行时间 ≈ 准备时间的几倍”为界；准备耗时占大头时，加分片只会多付准备成本。
- 分片后用汇总 job 作为必需检查，避免必需检查名随矩阵变化。

## macOS 与 runner 选择

- GitHub Free 账号 macOS 并发 5 个 job，Pro、Team 也是 5 个，由所有仓库和 workflow 共用；私有仓库 macOS 分钟按 10 倍计费。
- 留在 macOS：签名、打包、平台 API、原生 UI、需要真机系统库的测试。
- 移到 Ubuntu：格式化、lint、依赖审计、类型检查、纯逻辑单测、文档构建。
- Windows 同理，Windows 分钟按 2 倍计费。

## 去重清单

- 同一 lint/类型检查不在多个 job 或多个 workflow 中重复。
- `push` 与 `pull_request` 同时触发时，同一提交不要跑两遍：`push` 只限 main。
- 测试 job 已构建出的产物，发版或 e2e job 需要时用 artifact 传递，而不是重建；传递成本大于重建时例外。
- 不用的 setup：不需要 Node 的 job 不装 Node，不需要完整历史不设 `fetch-depth: 0`，不需要子模块不拉子模块。
