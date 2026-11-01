# Speed Up GitHub Actions

在不删减必要测试和功能校验的前提下，测量并缩短仓库 GitHub Actions CI 耗时，最后给出优化前后对比。

## 内容

| 入口 | 用途 |
| --- | --- |
| [SKILL.md](SKILL.md) | 测量 → 按证据优化 → 推送验证 → 交付对比的流程与边界 |
| [优化手册](references/playbook.md) | 并发取消、路径过滤与必需检查、缓存、二次构建、预编译工具、分片、macOS 配额、去重的写法与陷阱 |
| [scripts/ci_timing.py](scripts/ci_timing.py) | 用 `gh` 拉取最近运行，把 job 拆成排队/准备/执行三段，输出中位数表并与基线对比 |

```bash
python3 scripts/ci_timing.py fetch --repo OWNER/REPO --limit 50 --output ci-before.json
python3 scripts/ci_timing.py report ci-before.json --fold-matrix
python3 scripts/ci_timing.py report ci-after.json --baseline ci-before.json
```

## 前置条件

- Python 3.9+，已登录且对目标仓库有读取权限的 `gh` CLI。
- 推送验证分支、修改分支保护或必需检查需要用户授权；脚本只读，不修改仓库。

## 验证边界

| 层次 | 当前证据 |
| --- | --- |
| 离线脚本 | 7 项测试覆盖阶段拆分、跳过/取消排除、矩阵合并、分页、基线对比、仓库参数校验 |
| 真实数据 | `fetch` 与 `report` 已对公开仓库的最近运行实测可用 |
| 尚未覆盖 | 用技能完整优化一个真实仓库并对比前后、Agent 发现 |
| 许可 | 原帖与本技能均未声明许可 |

收录不等于安装。沿用仓库[安装指南](../../../doc/usage/quickstart.md)，只选择此技能目录。

[来源记录](upstream.json) / [许可说明](NOTICE.md) / [DevOps 集合](../README.md)
