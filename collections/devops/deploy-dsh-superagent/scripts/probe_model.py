#!/usr/bin/env python3
"""Send one minimal model request; never print a key, URL query, or full response."""
import argparse
import json
from pathlib import Path
import re
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ValueError('Model endpoint redirected; verify the API base URL')


def request_spec(c, max_tokens, allow_http=False):
    base = c['BASE_URL'].rstrip('/')
    parsed = urllib.parse.urlsplit(base)
    if parsed.scheme not in (('https', 'http') if allow_http else ('https',)) or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise ValueError('Use HTTPS without userinfo, query or fragment; HTTP needs explicit --allow-http')
    api, model, key = c['API'], c['MODEL'], c['API_KEY']
    headers = {'Content-Type': 'application/json'}
    if api == 'openai-completions':
        path = '/chat/completions'
        body = {'model': model, 'messages': [{'role': 'user', 'content': 'Reply with only OK.'}], 'max_tokens': max_tokens, 'stream': False}
        headers['Authorization'] = 'Bearer '+key
    elif api == 'openai-responses':
        path = '/responses'
        body = {'model': model, 'input': 'Reply with only OK.', 'max_output_tokens': max_tokens, 'stream': False}
        headers['Authorization'] = 'Bearer '+key
    elif api == 'anthropic-messages':
        path = '/messages' if base.endswith('/v1') else '/v1/messages'
        body = {'model': model, 'messages': [{'role': 'user', 'content': 'Reply with only OK.'}], 'max_tokens': max_tokens, 'stream': False}
        headers.update({'x-api-key': key, 'anthropic-version': '2023-06-01'})
    else:
        raise ValueError('Unsupported protocol')
    return urllib.request.Request(base+path, data=json.dumps(body).encode(), headers=headers)


def summarize(api, result):
    if api == 'openai-completions':
        choice = result.get('choices', [{}])[0]
        content = choice.get('message', {}).get('content')
        end = choice.get('finish_reason')
    elif api == 'anthropic-messages':
        content = ''.join(x.get('text', '') for x in result.get('content', []) if x.get('type') == 'text')
        end = result.get('stop_reason')
    else:
        content = ''.join(p.get('text', '') for x in result.get('output', []) for p in x.get('content', []) if p.get('type') == 'output_text')
        end = result.get('status')
    # Return booleans, not provider-controlled content that could echo credentials.
    return {'has_text': isinstance(content, str) and bool(content.strip()),
            'reply_is_OK': isinstance(content, str) and content.strip() == 'OK',
            'truncated': end in ('length', 'max_tokens', 'incomplete')}


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--env-file', type=Path, required=True)
    p.add_argument('--node', default='node')
    p.add_argument('--prefix', default='AGENT_LLM')
    p.add_argument('--max-tokens', type=int, default=64)
    p.add_argument('--allow-http', action='store_true', help='Only for an explicitly authorized plaintext endpoint')
    a = p.parse_args()
    if not re.fullmatch(r'[A-Z][A-Z0-9_]*', a.prefix) or not 1 <= a.max_tokens <= 4096:
        p.error('Invalid prefix or output token limit')
    fields = ['API', 'BASE_URL', 'MODEL', 'API_KEY']
    script = 'process.stdout.write(JSON.stringify(Object.fromEntries('+json.dumps(fields)+'.map(k=>[k,process.env['+json.dumps(a.prefix+'_')+'+k]||""]))))'
    try:
        child = subprocess.run([a.node, '--env-file='+str(a.env_file.resolve()), '-e', script],
                               text=True, capture_output=True, timeout=10, check=True)
        c = json.loads(child.stdout)
        missing = [k for k in fields if not c.get(k, '').strip()]
        if missing:
            print(json.dumps({'missing': missing}))
            return 1
        req = request_spec(c, a.max_tokens, a.allow_http)
        with urllib.request.build_opener(NoRedirect()).open(req, timeout=60) as response:
            result = json.load(response)
            status = response.status
        summary = summarize(c['API'], result)
        print(json.dumps({'protocol': c['API'], 'http_status': status, **summary}))
        return 0 if summary['reply_is_OK'] else 2
    except urllib.error.HTTPError as e:
        print(json.dumps({'http_status': e.code, 'success': False}))
    except Exception as e:
        print(json.dumps({'success': False, 'error_type': type(e).__name__}))
    return 1


if __name__ == '__main__':
    sys.exit(main())
