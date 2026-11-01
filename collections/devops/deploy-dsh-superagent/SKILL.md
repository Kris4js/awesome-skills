---
name: deploy-dsh-superagent
description: 在自托管 Linux 服务器部署或排查 DeepSeek Harness 与 dsh-superagent，接入飞书及 GitHub/GitLab，验证模型工具调用、消息收发和任务交付。适用于实际安装、迁移、恢复部署；不用于普通聊天机器人或仅解释项目原理。
---

# 部署 DSH 飞书智能体

交付目标是可验证的“飞书请求 → Ticket → Worker → 分支与 PR/MR → 原话题回复”。把已验证的安装、通道、执行和交付分别报告；健康检查通过不等于代码任务已跑通。

## 先确定部署现状

从用户已提供的信息继续，记录非敏感的服务器位置、代码仓库、平台、服务账号、模型协议、飞书应用和接单群。缺失且影响下一步的信息再问；不要重复索要已有答案。只有解释请求时，不安装任何东西。

读目标 checkout 的 AGENTS.md、SETUP.md、package.json 和部署文档。沿用现有凭据、profile、服务与端口；不要用 `--from-default-profile` 覆盖已有 profile。用户指定 GitLab 时，先确认适配实际存在，不把 GitHub 原型描述成开箱即用。

通过用户授权的 SSH 通道操作。已有 Rex SSH 窗格优先用 Rex CLI：先读已安装 rex 技能或 `rex __internal skill`，确认会话与窗格、捕获提示符，再发送命令。绝不向 agent 自己所在的窗格输入命令。CLI 不在 PATH 时可查找应用自带 helper；遵守工具权限，不以 UI 绕过拒绝。用户切换焦点时，按窗格 ID 操作并重新确认状态。

## 按依赖推进

| 阶段 | 执行内容 | 读取材料与完成证据 |
| --- | --- | --- |
| 环境 | 探测系统、架构、磁盘、内存、CPU、依赖和目标网络 | [运行环境](references/runtime.md)，保留版本和资源摘要 |
| 代码平台 | GitHub 用原生适配；GitLab 检查代码能力和基线 | [GitLab](references/gitlab.md)，验证账号、项目 ID、权限和真实 Git 读取 |
| DSH | 独立普通账号、模型配置、后台服务 | `scripts/render_config.py` 生成无密钥模板；模型最小请求与 DSH 只读工具测试均成功 |
| 飞书 | 机器人能力、必要权限、发布、bot-only CLI、长连接 | [飞书](references/feishu.md)，找到唯一目标群，接收用户测试消息并按授权回复 |
| 接单 | 来源、准入、Worker、prepare 命令和交付约定 | [配置与验收](references/acceptance.md)，设置回读、无 setup 错误、来源 ready |
| 实战 | 先只读任务，再执行用户明确指定的代码任务 | 实际 Ticket、工具报告、PR/MR、原话题消息与发送回执 |

安装和代码修改可在已有授权范围内持续推进。凭据录入、平台授权或用户未确定的实施方向需要其操作时，完成可独立进行的工作，并给出精确的下一步。不要为每条常规命令再创造确认流程；系统执行权限要求除外。

## 不变量

- 密钥不进入聊天、命令参数、模型上下文、生成页面或版本库。用服务账号在终端运行 `scripts/configure_credentials.py` 的隐藏输入；模型密钥由用户填写服务目录的 `.env`，权限 0600。
- API Key 引用用 `apiKeyEnv`；URL、协议与模型字段要接到实际 provider 配置。仅创建 `.env` 不代表 DSH 已使用它。
- 普通服务账号运行 DSH，root 只用于安装与服务管理。工作目录不是安全隔离；不要把能执行 shell 的 Worker 当成受限沙箱。
- 服务默认绑定回环地址。需要远程管理时使用 SSH 转发或明确配置的认证入口；不要为省步骤关闭认证或开放公网管理端口。不要把含登录 token 的启动 URL打印到共享输出。
- 平台读消息权限与“谁能发起任务”分开。仅在用户指定群配置准入；全员接单用该群的 `unlistedAddressed: explicit`，不顺带开放其他群或私聊。
- 并发是资源决策，不硬编码成 2 或 4。实测 available memory、DSH 占用、CPU、构建峰值与后台任务；无峰值数据时先低并发。用户明确调整后保存并回读，不声称已完成压力测试。
- 接单前保存可恢复状态；外部发送不宣称 exactly-once。测试发送复用幂等键，超时后先查远端结果，避免重复创建消息、分支、MR 或服务。

## 随附资源

- `scripts/render_config.py`：离线生成 systemd、模型 provider 和环境变量模板，不安装、不启动服务。
- `scripts/configure_credentials.py`：用户在服务器交互运行，验证 GitLab 身份/权限后配置 glab，或把现有飞书应用导入独立 bot-only CLI。无参数接受明文密钥。
- `scripts/probe_model.py`：用 Node 的 dotenv 解析读取模型配置，只发最小请求，输出状态而非密钥或完整响应。
- `assets/gitlab-adapter.patch`：本次原型的 GitLab 适配源码与测试。必须按 GitLab 参考文档验证基线和应用结果，不能无条件打补丁。

交付时给出运行账号、服务名、配置位置、接单范围、并发数、真实测试结果和剩余边界。不要在未完成真实任务前宣称飞书到代码交付全链路通过。
