import importlib.util,json,pathlib,subprocess,tempfile,unittest,urllib.error
from unittest.mock import patch
ROOT=pathlib.Path(__file__).resolve().parents[1]/'collections/devops/deploy-dsh-superagent'
def load(name):
 s=importlib.util.spec_from_file_location(name,ROOT/'scripts'/f'{name}.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);return m
cred=load('configure_credentials');model=load('probe_model');render=load('render_config')
class Checks(unittest.TestCase):
 def repo(self,**kw):
  return dict(id=7,path_with_namespace='group/sub/repo',archived=False,permissions={'project_access':{'access_level':30}},default_branch='main',**kw)
 def test_identity_and_privilege_fail_closed(self):
  for user in [{'username':'admin','is_admin':True},{'username':'other'},{'username':'bot','is_admin':True}]:
   with self.subTest(user=user),self.assertRaises(cred.SetupFailure):cred.verify_gitlab(lambda stage,path:user,'group/sub/repo','bot')
 def test_permission_and_project_fail_closed(self):
  for mutate in [{'archived':True},{'path_with_namespace':'group/other'},{'permissions':{'project_access':{'access_level':20}}}]:
   repo=self.repo();repo.update(mutate)
   with self.subTest(mutate=mutate),self.assertRaises(cred.SetupFailure):cred.verify_gitlab(lambda stage,path:{'username':'bot'} if stage=='identity' else repo,'group/sub/repo','bot')
 def test_exact_numeric_fallback(self):
  calls=[]
  def get(stage,path):
   calls.append((stage,path))
   if stage=='identity':return {'username':'bot'}
   if stage=='project-by-path':raise urllib.error.HTTPError('x',404,'not found',{},None)
   if stage=='project-search':return [{'id':8,'path_with_namespace':'other/repo'},{'id':7,'path_with_namespace':'group/sub/repo'}]
   return self.repo()
  self.assertEqual(cred.verify_gitlab(get,'group/sub/repo','bot')['project_id'],7)
  self.assertEqual(calls[-1],('project-by-id','projects/7'))
 def test_search_does_not_pick_similar_project(self):
  def get(stage,path):
   if stage=='identity':return {'username':'bot'}
   if stage=='project-by-path':raise urllib.error.HTTPError('x',404,'not found',{},None)
   return [{'id':8,'path_with_namespace':'other/repo'}]
  with self.assertRaises(cred.SetupFailure):cred.verify_gitlab(get,'group/sub/repo','bot')
 def test_cli_failure_does_not_echo_secret(self):
  with patch.object(cred.subprocess,'run',return_value=subprocess.CompletedProcess([],1,'sensitive-sentinel','sensitive-sentinel')):
   with self.assertRaises(cred.SetupFailure) as c:cred.run_secret(['fake'],'sensitive-sentinel',{})
   self.assertNotIn('sensitive-sentinel',str(c.exception))
 def test_no_redirect_with_credentials(self):
  with self.assertRaises(cred.SetupFailure):cred.NoRedirect().redirect_request(None,None,302,'',{},'https://elsewhere.invalid')
 def test_model_endpoints_and_headers(self):
  c={'BASE_URL':'https://models.example/v1','MODEL':'test','API_KEY':'test-only-secret'}
  for api,suffix,header in [('openai-completions','/chat/completions','Authorization'),('openai-responses','/responses','Authorization'),('anthropic-messages','/messages','X-api-key')]:
   r=model.request_spec(dict(c,API=api),64)
   self.assertEqual(r.full_url,c['BASE_URL']+suffix)
   self.assertIn('test-only-secret',r.get_header(header))
 def test_model_unsafe_url_rejected(self):
  for url in ['http://models.example/v1','https://user:pass@models.example/v1','https://models.example/v1?key=x']:
   with self.assertRaises(ValueError):model.request_spec({'BASE_URL':url,'API':'openai-completions','MODEL':'x','API_KEY':'y'},64)
  model.request_spec({'BASE_URL':'http://localhost:8000/v1','API':'openai-completions','MODEL':'x','API_KEY':'y'},64,True)
 def test_model_summary_never_prints_content(self):
  result=model.summarize('openai-completions',{'choices':[{'message':{'content':'sensitive-sentinel'},'finish_reason':'stop'}]})
  self.assertTrue(result['has_text']);self.assertFalse(result['reply_is_OK']);self.assertNotIn('sensitive-sentinel',json.dumps(result))
 def test_template_and_no_clobber(self):
  with tempfile.TemporaryDirectory() as d:
   out=pathlib.Path(d)/'templates'
   args=['python3',str(ROOT/'scripts/render_config.py'),'--output',str(out)]
   subprocess.run(args,check=True,capture_output=True)
   old=(out/'dsh-agent.service').read_bytes()
   self.assertIn(b'--host 127.0.0.1',old)
   self.assertEqual((out/'.env.example').stat().st_mode & 0o777,0o600)
   self.assertNotEqual(subprocess.run(args,capture_output=True).returncode,0)
   self.assertEqual((out/'dsh-agent.service').read_bytes(),old)
 def test_template_injection_rejected(self):
  with self.assertRaises(ValueError):render.render('/var/lib/a\nExecStart=/evil','bot','bot',3082,'/bin/dsh')
 def test_probe_cli_invalid_protocol_no_secret_output(self):
  with tempfile.TemporaryDirectory() as d:
   env=pathlib.Path(d)/'.env';env.write_text('AGENT_LLM_API=not-a-protocol\nAGENT_LLM_BASE_URL=https://example.invalid/v1\nAGENT_LLM_MODEL=test\nAGENT_LLM_API_KEY=sensitive-sentinel\n')
   r=subprocess.run(['python3',str(ROOT/'scripts/probe_model.py'),'--env-file',str(env)],capture_output=True,text=True)
   self.assertEqual(r.returncode,1);self.assertNotIn('sensitive-sentinel',r.stdout+r.stderr)
if __name__=='__main__':unittest.main(verbosity=2)
