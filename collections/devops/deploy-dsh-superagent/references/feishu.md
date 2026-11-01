# 飞书应用与消息验证

使用企业自建应用的机器人能力，而不是仅能往群里发消息的自定义 webhook 机器人。应用发布和权限审批由有权用户完成。既有应用优先复用，不另建重复应用。

## 权限

按实际使用接口申请应用身份权限，并在飞书官方文档再次核对当前标识。

| 权限 | 用途 |
| --- | --- |
| im:message.group_at_msg:readonly | 接收群内 @ 事件 |
| im:message.p2p_msg:readonly | 启用私聊时接收私聊消息 |
| im:message:readonly | 原消息与上下文读取 |
| im:message:send_as_bot | 回帖 |
| im:chat:read | 查询机器人所在群 |
| im:chat.members:read | 需要名单同步时读取群成员 |
| im:message.group_msg | 原项目群历史补收、群话题上下文 |

群历史接口除了消息只读权限，还要求群消息权限；`im:message.group_msg` 是敏感权限。说明原因，先在专用测试群验证。应用内“仅 @ 接单”不缩小平台已授予的读取能力。不为接消息顺带申请文档、日历、邮件和通讯录写入权限。

官方参考：[历史消息](https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/list)、[消息事件](https://open.feishu.cn/document/server-docs/im-v1/message/events/receive)。

## 配置与顺序

1. 启用机器人能力，设置应用可用范围，申请权限并发布版本。
2. 用户以服务账号运行 `configure_credentials.py --service-user <Linux账号> feishu --app-id <App-ID> --config-dir <独立配置目录>`，隐藏输入 App Secret。脚本使用 `--app-secret-stdin`，然后将这个独立配置设为 bot-only。
3. 凭据配置目录通过 `LARKSUITE_CLI_CONFIG_DIR` 固定在服务账号内；包装脚本执行绝对路径的 lark-cli，避免 worker shim 递归。
4. 验证 `auth status`、`config strict-mode`、`api GET /open-apis/bot/v3/info --as bot --format ndjson`。
5. 将机器人加入目标群；用 `im +chat-list --page-all` 查 chat_id。重名群不能猜选，要求用户确认。
6. 订阅 `im.message.receive_v1`，选择长连接。如果控制台要求已有连接才能保存，先启动消费者后再保存；按平台要求发布更新版本。

`event consume` 无界限后台运行时可能因 stdin EOF 退出。测试使用 `--timeout 20m` 等有界方式；原插件用打开的 stdin 管道维持长期消费者。日志中的 `[event] ready` 和 websocket connected 是连接证据，真实消息到达是接收证据。

CLI 可能提示未申请 application:self_manage / app_version 预检查权限但仍正常 connected；不要仅为消除这个提示扩大应用管理权限。

## 最小验证

让用户在目标群 @ 机器人发送一个唯一测试短语。临时 listener 只保留目标群消息 ID、发送者 ID 和测试匹配标志，不保存整段聊天。验证群 ID 和发送者后，若用户授权了回帖测试，用原 message_id 回复一句测试结果，设置稳定幂等键。

测试结束停止临时 listener，或等待其有界超时；不要同时留下多个长期消费者。真正接单由插件接管。群名、App ID、open_id 和 message_id 是每次部署的数据，不能复用技能开发时的值。
