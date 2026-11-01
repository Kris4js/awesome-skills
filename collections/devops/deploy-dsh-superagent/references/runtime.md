# 运行环境与模型

## 探测与安装

检查 Node、pnpm、Git、Python、tmux（仅使用原项目启动脚本时）、DSH、代码平台 CLI、lark-cli，以及磁盘、CPU、`free -m` 和现有服务。确认仓库/模型/飞书 API 可达；HTTP 登录重定向只能证明网络可达。

从目标仓库读取 `engines`、`packageManager` 与部署说明。此次验证组合为 Node 24、pnpm 11.7.0、DSH 0.2.1-rc.3、lark-cli 1.0.90；这些是已验证基线，不是永远应安装的最新版。安装时重新核对官方发行源和兼容范围。

- Node 官方发行包按架构下载，使用对应版本 SHASUMS256 验证再解压。
- DSH、pnpm、飞书 CLI 通过官方 npm 包安装；飞书包名为 `@larksuite/cli`。
- GitLab CLI 从 GitLab 官方 release 下载对应架构包并核对 checksums。
- npm 新版本可能成功退出但跳过 install/postinstall。检查日志；仅对确认需要的已安装包一次性允许脚本并 rebuild，不全局开启所有脚本。此次涉及 lark-cli、DSH subprocess helper、node-pty、koffi；以当前日志为准。
- 本地开发按项目锁文件安装。沙箱禁止网络/本机端口时按执行工具要求提权重试，不把 EPERM 当成业务失败。

## 账号、目录和服务

选择专用普通 Linux 账号，默认不授予 sudo。服务目录示例 `/var/lib/dsh-agent`；既有目录先查所有权和内容。只对本次生成文件设置所属账号，不对整棵已有目录递归 chown。

运行 `scripts/render_config.py --help`，在暂存目录生成模板，检查后复制到服务器的相应位置。模板使用 `/usr/local/bin/dsh`，安装位置不同时传 `--dsh-bin`。

首次安装才执行：

```sh
dsh superagent --from-default-profile web --dump-config > /dev/null
```

应在服务账号及其工作目录执行。root 当前目录会导致普通账号尝试读取 `/root/.env` 而失败。

systemd 与仓库 tmux 启动脚本二选一，不同时管理同一 profile。systemd 示例只启动 Harness；插件必须另行安装和配置。先验证 `dsh --version`，再验证 HTTP 和插件管理状态。根页面 401 表示认证入口在响应，不代表模型与插件就绪。

## 模型配置

在服务工作目录放 `.env`，示例变量为 `AGENT_LLM_API`、`AGENT_LLM_BASE_URL`、`AGENT_LLM_MODEL`、`AGENT_LLM_API_KEY`。这是本技能模板命名，不是 DSH 内置约定。provider patch 用 `!!js process.env...` 读取非敏感字段，并用 `apiKeyEnv` 引用密钥。

协议仅在确认后选择：`openai-completions`、`openai-responses`、`anthropic-messages`。Base URL 使用 API 根地址，不包含具体推理 endpoint。不要因为安装 DSH 就假定用户使用 DeepSeek 官方 API。

已安装 DSH 的 package README 和 schema 是配置依据，特别是 `dsh-llm-pi-ai`、`dsh-agent-default-model`、`dsh-headless`。检查 dotenv 加载规则：本次版本在 inherited environment、工作目录 `.env`、Harness home `.env` 之间有优先级，导出的空变量也可能遮蔽文件。不要直接 `source` 不可信环境文件。

先由用户填写模板，以服务账号运行 probe_model 最小请求。默认要求 HTTPS；用户明确选择可信的 HTTP 内网/本地推理服务时才用 `--allow-http`，不自动降级。成功后接入 provider/default-model，再创建随机内容的专用测试文件，以相同模型 patch 运行 `dsh headless --json`。只授权读取该文件；检查 tool_call、tool_result completed、final 与文件内容匹配、退出码为 0。普通 API 返回 OK 不能替代这一步。

读取启动日志时隐藏 `?token=...`；不要 dump 整份环境变量或凭据文件。改模型和 profile 后重启服务；普通 Worker 并发设置通过管理 API 即时生效，无需重启。
