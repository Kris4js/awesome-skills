#!/usr/bin/env python3
"""Run interactively as the intended Linux service account. Never accepts a secret argument."""
import argparse
import getpass
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.error
import urllib.parse
import urllib.request


class SetupFailure(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise SetupFailure('API redirected; verify the configured host before sending credentials')


def verify_gitlab(get, project, expected_user):
    """get(stage, path) is injectable so failure/identity invariants can be tested offline."""
    user = get('identity', 'user')
    if user.get('username') != expected_user or user.get('is_admin'):
        raise SetupFailure('Expected the named non-administrator automation user; nothing saved')
    try:
        repo = get('project-by-path', 'projects/'+urllib.parse.quote(project, safe=''))
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        matches = []
        for page in range(1, 21):
            params = urllib.parse.urlencode({'search': project.rsplit('/', 1)[-1],
                                            'simple': 'true', 'per_page': 100, 'page': page})
            rows = get('project-search', 'projects?'+params)
            if not isinstance(rows, list):
                raise SetupFailure('Unexpected project search response')
            matches.extend(x for x in rows if x.get('path_with_namespace') == project)
            if len(rows) < 100:
                break
        else:
            raise SetupFailure('Project search exceeded its bound; supply a more precise project')
        if len(matches) != 1:
            raise SetupFailure('Exact project not uniquely visible; check membership, invitations and path')
        repo = get('project-by-id', 'projects/'+str(matches[0]['id']))
    if repo.get('path_with_namespace') != project or repo.get('archived'):
        raise SetupFailure('Wrong project or archived repository; nothing saved')
    permissions = repo.get('permissions') or {}
    access = max((permissions.get(k) or {}).get('access_level', 0)
                 for k in ('project_access', 'group_access'))
    if access < 30:
        raise SetupFailure('Developer access or higher is required; nothing saved')
    return {'user': user['username'], 'project_id': repo['id'], 'project': project,
            'access_level': access, 'default_branch': repo.get('default_branch')}


def run_secret(command, secret, env, stdin=True):
    try:
        result = subprocess.run(command, input=secret+'\n' if stdin else '', text=True,
                                capture_output=True, env=env, timeout=90)
    except (subprocess.TimeoutExpired, OSError):
        raise SetupFailure('CLI timed out or could not start; check installed tools locally')
    if result.returncode:
        # Do not echo CLI arguments, stdout, stderr or potentially credential-bearing error responses.
        raise SetupFailure('CLI failed with exit '+str(result.returncode)+'; inspect its local configuration')


def configure_gitlab(a):
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9.-]*(?::[0-9]+)?', a.host):
        raise SetupFailure('Supply a hostname, without scheme, path or credentials')
    if not re.fullmatch(r'[\w.-]+(?:/[\w.-]+)+', a.project) or '..' in a.project.split('/'):
        raise SetupFailure('Supply an exact group[/subgroup]/project path')
    token = getpass.getpass('GitLab token (hidden): ').strip()
    if not token:
        raise SetupFailure('Empty token; nothing saved')
    stage = ['identity']
    opener = urllib.request.build_opener(NoRedirect())

    def get(label, path):
        stage[0] = label
        request = urllib.request.Request('https://'+a.host+'/api/v4/'+path,
                                         headers={'PRIVATE-TOKEN': token})
        with opener.open(request, timeout=30) as response:
            return json.load(response)

    try:
        info = verify_gitlab(get, a.project, a.expected_user)
    except urllib.error.HTTPError as e:
        raise SetupFailure('GitLab '+stage[0]+' failed: HTTP '+str(e.code)+'; nothing saved')
    except (urllib.error.URLError, TimeoutError, ValueError, KeyError, TypeError):
        raise SetupFailure('GitLab '+stage[0]+' failed: connection or invalid response; nothing saved')
    env = dict(os.environ)
    for k in ('GITLAB_TOKEN', 'GITLAB_ACCESS_TOKEN', 'OAUTH_TOKEN', 'CI_JOB_TOKEN', 'GITLAB_HOST', 'GITLAB_REPO'):
        env.pop(k, None)
    run_secret([a.cli, 'auth', 'login', '--hostname', a.host, '--api-protocol', 'https',
                '--git-protocol', 'https', '--stdin', '--setup-git-credential-helper'], token, env)
    config = Path(os.environ.get('GLAB_CONFIG_DIR', str(Path.home()/'.config/glab-cli')))/'config.yml'
    if config.exists():
        config.chmod(0o600)
    print(json.dumps(info))
    print('CLI login configured. Validate git ls-remote separately; push has not been tested.')


def configure_feishu(a):
    if not re.fullmatch(r'cli_[A-Za-z0-9]+', a.app_id):
        raise SetupFailure('Invalid app ID')
    config = a.config_dir.expanduser().resolve()
    if config.exists() and any(config.iterdir()) and not a.replace_existing:
        raise SetupFailure('Config directory is nonempty. Inspect it; use --replace-existing only for an intended reconfiguration')
    config.mkdir(mode=0o700, parents=True, exist_ok=True)
    secret = getpass.getpass('Feishu App Secret (hidden): ').strip()
    if not secret:
        raise SetupFailure('Empty secret; nothing saved')
    env = dict(os.environ, LARKSUITE_CLI_CONFIG_DIR=str(config))
    run_secret([a.cli, 'config', 'init', '--app-id', a.app_id, '--brand', a.brand,
                '--app-secret-stdin'], secret, env)
    run_secret([a.cli, 'config', 'strict-mode', 'bot', '--global'], secret, env, stdin=False)
    print('Bot-only CLI configured. Verify auth status and bot info before starting events.')


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--service-user', required=True, help='Expected current Linux user')
    sub = p.add_subparsers(dest='kind', required=True)
    gl = sub.add_parser('gitlab')
    gl.add_argument('--host', required=True)
    gl.add_argument('--project', required=True)
    gl.add_argument('--expected-user', required=True)
    gl.add_argument('--cli', default='/usr/bin/glab')
    fs = sub.add_parser('feishu')
    fs.add_argument('--app-id', required=True)
    fs.add_argument('--config-dir', type=Path, required=True)
    fs.add_argument('--brand', choices=['feishu', 'lark'], default='feishu')
    fs.add_argument('--cli', default='/usr/local/bin/lark-cli')
    fs.add_argument('--replace-existing', action='store_true')
    a = p.parse_args()
    import pwd
    if pwd.getpwuid(os.geteuid()).pw_name != a.service_user or os.geteuid() == 0:
        p.exit(1, 'Run as the specified non-root service user\n')
    if not Path(a.cli).is_absolute():
        p.exit(1, 'CLI path must be absolute\n')
    os.umask(0o077)
    try:
        configure_gitlab(a) if a.kind == 'gitlab' else configure_feishu(a)
    except (SetupFailure, OSError) as e:
        p.exit(1, str(e)+'\n')


if __name__ == '__main__':
    main()
