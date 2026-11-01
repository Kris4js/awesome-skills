# GitLab 分支：适配、认证与边界

原始 dsh-superagent 绑定 GitHub。认证成功不等于插件支持 GitLab，改 remote 或将 gh 改名为 glab 也不足以接入。

## 随附补丁

`assets/gitlab-adapter.patch` 针对原型基线 commit：

```text
6337fc823ce20251c8de8085948165c81aaa701e
```

补丁包括部署认证、GitLab SourceKind、Worker glab 凭据包装、MR 归属/状态、回帖和测试。它不包含 Go 学习版、运行数据、密钥、安装后的 node_modules 或 lib。

先检查 checkout 是否已经包含这些能力，避免重复应用。对匹配基线先运行 `git apply --check <patch>`；应用后按锁文件安装并执行 typecheck、测试、build。不同基线先审查差异与 API 兼容性，不强行应用或覆盖用户修改。保留已有 GitHub 路径。构建产物上传后比对 SHA-256，使用新安装包路径更新 DSH profile，并保留上一包可回退。

当前补丁覆盖：飞书发起任务、指定仓库的工作分支、MR 验证与绑定、绑定 MR 的 notes/流水线/关闭轮询、原话题结果通知。新 MR 必须属于机器人、同一项目、当前 Ticket 分支，且没有其他活跃 Ticket 占用。`ready` 不等于 merged。

不覆盖：仓库全量 GitLab issue/MR 主动接单、强制自动登记 issue、完整 inline review resolution、自动审批和自动合并。若用户需要这些，另行实现和验证。内部 `Deployment.github` 仍存放通用执行身份，`Deployment.gitlab` 选择平台；不能据字段名误调用 GitHub API。

## 认证

专用普通 GitLab 账号加入目标项目，通常 Developer 即可；使用该账号的 Token，不用管理员 Token。API 与 HTTPS 推送可用 `api`、`write_repository`，按组织策略设置到期时间。权限说明：[GitLab tokens](https://docs.gitlab.com/user/profile/personal_access_tokens/)。

用户在服务器以服务账号运行 `configure_credentials.py --service-user <Linux账号> gitlab --host <主机> --project <项目路径> --expected-user <GitLab账号>`，提供 host、project、expected-user 和绝对 glab 路径。Token 隐藏输入，先校验 `/user`、准确项目、未归档、Developer-or-higher，再通过 stdin 配置 glab。没有桌面 keyring 时 glab 可能使用受权限保护的配置文件，告知实际存储方式，不打印内容。

遇到 404 按阶段定位：账号 API、项目 API、URL 编码或项目可见性。项目路径 404 时，脚本搜索可见项目并精确匹配 path_with_namespace，再用数字 ID 获取；不改选名字相似的仓库。如果账号可验证但项目不可见，检查项目成员、未接受邀请和路径。失败不保存 Token。

若 Token 被粘到 shell 提示符并作为命令执行，提醒用户撤销重建；不要回显或搜集那个 Token。

## 反向代理与 Git

GitLab 可能返回内网 `web_url` / `http_url_to_repo`。验证 project ID 与 path，但始终使用用户配置的 HTTPS 主机执行 API/clone、生成 MR 链接。不要跟随返回地址把凭据发到另一主机。

验证 API 后还要用机器人账号 `git ls-remote`。配置 worker-gitconfig 后在同样环境再验证一次；DSH 会过滤敏感命名环境变量，worker 不应依赖环境里的临时 GitLab Token。

克隆到独立目录。prepare 命令应 fetch 目标基线、创建 `agent/$DSH_SUPERAGENT_NAME` worktree、设置提交身份。已有目录不重新 clone；不能用 reset/clean 覆盖用户或正在运行任务的工作区。
