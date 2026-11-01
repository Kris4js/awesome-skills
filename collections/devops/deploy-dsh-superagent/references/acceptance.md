# 配置、上线与验收

## 管理 API

先读取当前版本文档。此次原型的端点是回环地址 `/orchestrator/api/`，带 `x-orchestrator-request: 1`。根管理页面可能要求 DSH 登录 cookie；不要将页面的 401 与插件 API 状态混为一谈，也不要为操作方便禁用认证。

读取 `GET settings`，逐块保存完整 value 和当前 revision。PUT 到 `settings/source:gitlab`、`settings/source:feishu`、`settings/policy`、`settings/eval`、`settings/executor`。返回 `restarting: true` 后等待接口恢复，再读取新 revision，避免连续写入旧版本。

首次配置可暂停处理：`POST executor/pause`，body 为 `{"paused":true}`。来源仍可能接收消息。配置结束先看 queued tickets/pending triggers，避免把旧测试对话误当开发要求。未经用户要求，不清空审计记录。

## 准入和资源

- 来源只包含用户选择的群，默认 listen=mentions。私聊和其他群是否接收由用户范围决定。
- 单人测试可用 allowed open_id；群全员接单时，仅对该 chat_id 设置 `unlistedAddressed: explicit`。用户未要求自动发现任务时使用 `eval.mode: off` 或 observe；明确 @ 请求仍可开工。
- main Session 与 Worker 选用已验证的 provider/model。新会话默认模型变化不自动改动已有会话。
- `maxWorkers` 是自动运行槽位，不是预先启动固定进程；原实现对人工继续操作可能提供额外槽位。说明名义并发与实际后台进程/子任务的区别。
- 同时运行编译、测试和子智能体会增加内存。约 2 GB、可用约 800 MiB、无 Swap 的实例不能据空闲模型会话占用判断 4 个代码任务稳定。先低并发，明确用户选择可设 2，再测峰值。增加 Swap 不等于增加实际计算容量。

## 验收顺序

| 层次 | 证据 |
| --- | --- |
| 安装 | CLI 版本、原生安装脚本成功、服务以普通账号运行 |
| 模型 | 最小 API 请求成功，DSH 真实 read 工具调用与随机文件一致 |
| 飞书 | 身份 ready、bot-only、目标群唯一、收到唯一测试消息、授权回帖成功 |
| 仓库 | 机器人身份、准确项目权限、正常 clone、worker 隔离 Git 配置下可读取 |
| 插件 | setup.problem 与 feishuProblem 为空，runtime/feishu/history/gitlab ready |
| 设置 | 回读接单范围、模型、maxWorkers、prepare、paused 状态 |
| 只读任务 | 用户在群里 @ 请求 README 概要，出现 Ticket、Worker 执行和结果回帖 |
| 代码任务 | 用户指定一个小改动；验证分支、相关测试、真实 PR/MR、原话题结果；合并/关闭后核对收尾 |

开启处理需属于用户授权的实战范围，且前置检查已通过。不要替用户虚构开发需求或自行向群里发起任务。发送消息必须有用户授权；配置服务的授权不等于任意广播权限。

维护非敏感部署记录：服务器用途、运行账号、service/profile、版本、仓库路径、来源范围、并发、配置文件位置、测试证据与未完成项。不能记录实际密钥、登录 URL token 或完整聊天历史。
