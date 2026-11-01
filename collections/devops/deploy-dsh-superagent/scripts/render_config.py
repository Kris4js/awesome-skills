#!/usr/bin/env python3
"""Generate reviewable, secret-free deployment templates without touching a server."""
import argparse
import json
import re
from pathlib import Path


def render(root, user, service, port, dsh_bin):
    for value in (user, service):
        if not re.fullmatch(r'[a-z_][a-z0-9_-]{0,30}', value):
            raise ValueError('Use a simple Linux account/service name')
    for value in (root, dsh_bin):
        if not re.fullmatch(r'/[A-Za-z0-9_./-]+', value) or '..' in Path(value).parts:
            raise ValueError('Paths must be absolute and contain no spaces or shell metacharacters')
    if not 1024 <= port <= 65535:
        raise ValueError('Choose an unprivileged TCP port')
    env = ('# Fill on the server as the service account. Do not commit.\n'
           'AGENT_LLM_API=openai-completions\nAGENT_LLM_BASE_URL=\n'
           'AGENT_LLM_MODEL=\nAGENT_LLM_API_KEY=\n')
    patch = '''- id: llm-pi-ai
  config:
    providers:
      team-agent:
        displayName: Team agent model
        apiKeyEnv: AGENT_LLM_API_KEY
        api: !!js process.env.AGENT_LLM_API
        baseURL: !!js process.env.AGENT_LLM_BASE_URL
        defaultMaxTokens: 4096
        retryPolicy:
          mode: normal
          maxRetries: 1
        models:
          - id: !!js process.env.AGENT_LLM_MODEL
- id: agent-default-model
  config:
    provider: team-agent
    model: !!js process.env.AGENT_LLM_MODEL
'''
    unit = f'''[Unit]
Description=DeepSeek Harness team agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User={user}
Group={user}
WorkingDirectory={root}
Environment=HOME={root}
Environment=PATH=/usr/local/bin:/usr/bin:/bin
ExecStart={dsh_bin} --profile superagent --host 127.0.0.1 --port {port} --no-open
Restart=on-failure
RestartSec=5
UMask=0077

[Install]
WantedBy=multi-user.target
'''
    return {'.env.example': env, 'model.patch.yml': patch, service+'.service': unit,
            'deployment.json': json.dumps({'root': root, 'user': user, 'service': service,
                                          'profile': 'superagent', 'port': port}, indent=2)+'\n'}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--output', type=Path, required=True, help='New local output directory')
    p.add_argument('--root', default='/var/lib/dsh-agent')
    p.add_argument('--user', default='dsh-agent')
    p.add_argument('--service', default='dsh-agent')
    p.add_argument('--port', type=int, default=3082)
    p.add_argument('--dsh-bin', default='/usr/local/bin/dsh')
    a = p.parse_args()
    try:
        files = render(a.root, a.user, a.service, a.port, a.dsh_bin)
        a.output.mkdir(mode=0o700, parents=True, exist_ok=False)
        for name, body in files.items():
            file = a.output/name
            with file.open('x') as f:
                f.write(body)
            file.chmod(0o600)
    except (ValueError, OSError) as e:
        p.exit(1, str(e)+'\n')
    print('Templates created. Review before installing; no credentials or services changed.')


if __name__ == '__main__':
    main()
