"""Controle financeiro local. Execute: python servidor.py"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import json, sqlite3, datetime, os, urllib.parse, webbrowser, argparse
BASE=Path(__file__).resolve().parent
DB=BASE/'dados-financeiros.sqlite3'
def connect(): return sqlite3.connect(DB,timeout=10)
def init():
 with connect() as db:
  db.executescript((BASE/'drizzle/0000_financial_state.sql').read_text(encoding='utf8').replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS'))
  db.execute('INSERT OR IGNORE INTO financial_state VALUES(?,?,1,?)',('main',(BASE/'lib/initial-data.json').read_text(encoding='utf8'),datetime.datetime.now(datetime.timezone.utc).isoformat()))
def validate(s):
 if not isinstance(s,dict): return False
 if not isinstance(s.get('year'),int) or not 2000<=s['year']<=2100:return False
 for key,size in [('allocation',3),('monthlyTargets',12)]:
  a=s.get(key)
  if not isinstance(a,list) or len(a)!=size or any(not isinstance(v,(int,float)) or v<0 or v>1e12 for v in a):return False
 if abs(sum(s['allocation'])-100)>.01:return False
 if len(s.get('monthStates',[]))!=12 or any(v not in ['realizado','previsto'] for v in s['monthStates']):return False
 for k in ['essentialMonthlyCents','wealthCents']:
  if not isinstance(s.get(k),int) or not 0<=s[k]<=1e12:return False
 for k in ['categories','banks','cards','sourceSheets','help']:
  if not isinstance(s.get(k),list) or len(s[k])>200 or any(not isinstance(v,str) for v in s[k]):return False
 if not isinstance(s.get('wealthGoals'),list) or len(s['wealthGoals'])>20 or any(not isinstance(v,int) or v<=0 or v>1e12 for v in s['wealthGoals']):return False
 states=s.get('yearMonthStates',{})
 if not isinstance(states,dict) or any(not isinstance(k,str) or v not in ['realizado','previsto'] for k,v in states.items()):return False
 records=s.get('records'); ids=set()
 if not isinstance(records,list) or len(records)>10000:return False
 for r in records:
  if not isinstance(r,dict) or not isinstance(r.get('id'),str) or r['id'] in ids:return False
  ids.add(r['id'])
  if 'year' in r and (not isinstance(r['year'],int) or not 2000<=r['year']<=2100):return False
  for k in ['installmentNumber','installmentCount']:
   if k in r and (not isinstance(r[k],int) or not 1<=r[k]<=120):return False
  if 'installmentGroup' in r and (not isinstance(r['installmentGroup'],str) or len(r['installmentGroup'])>100):return False
  if r.get('kind') not in ['fixed','variable','card','income','investment','reserve','investment_withdrawal','reserve_withdrawal'] or not isinstance(r.get('month'),int) or not 1<=r['month']<=12:return False
  if not isinstance(r.get('cents'),int) or not 0<=r['cents']<=1e12 or not isinstance(r.get('paid'),bool):return False
  for k in ['description','category','bank','date']:
   if not isinstance(r.get(k),str) or len(r[k])>200:return False
  if not r['description']:return False
  if r['date']:
   try:datetime.date.fromisoformat(r['date'])
   except ValueError:return False
 investment=s['wealthCents']+sum(r['cents'] if r['kind']=='investment' else -r['cents'] if r['kind']=='investment_withdrawal' else 0 for r in records)
 reserve=sum(r['cents'] if r['kind']=='reserve' else -r['cents'] if r['kind']=='reserve_withdrawal' else 0 for r in records)
 if investment<0 or reserve<0:return False
 return True
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(BASE/'local-dist'),**kw)
 def send_json(self,value,status=200):
  body=json.dumps(value,ensure_ascii=False).encode();self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body)
 def valid_host(self):return self.headers.get('Host') in {f'127.0.0.1:{self.server.server_port}',f'localhost:{self.server.server_port}'}
 def do_GET(self):
  if not self.valid_host():return self.send_json({'error':'Host inválido'},403)
  if urllib.parse.urlsplit(self.path).path=='/api/state':
   try:
    with connect() as db:row=db.execute('SELECT payload,version,updated_at FROM financial_state WHERE id=?',('main',)).fetchone()
    self.send_json({'state':json.loads(row[0]),'version':row[1],'updatedAt':row[2]})
   except Exception:self.send_json({'error':'Não foi possível carregar os dados.'},503)
  else:super().do_GET()
 def do_PUT(self):
  if not self.valid_host():return self.send_json({'error':'Host inválido'},403)
  if self.path!='/api/state':return self.send_json({'error':'Rota inexistente'},404)
  origin=self.headers.get('Origin');allowed={f'http://127.0.0.1:{self.server.server_port}',f'http://localhost:{self.server.server_port}'}
  if origin and origin not in allowed:return self.send_json({'error':'Origem inválida'},403)
  try:
   length=int(self.headers.get('Content-Length',0))
   if length<=0 or length>2000000:return self.send_json({'error':'Dados inválidos ou muito grandes'},413)
   body=json.loads(self.rfile.read(length));s=body.get('state');version=body.get('version')
   if not validate(s) or not isinstance(version,int):return self.send_json({'error':'Revise os valores informados.'},400)
   with connect() as db:
    result=db.execute('UPDATE financial_state SET payload=?,version=version+1,updated_at=? WHERE id=? AND version=?',(json.dumps(s,ensure_ascii=False),datetime.datetime.now(datetime.timezone.utc).isoformat(),'main',version))
    if not result.rowcount:return self.send_json({'error':'Os dados foram alterados em outra janela. Recarregue antes de salvar.'},409)
   self.send_json({'version':version+1})
  except Exception:self.send_json({'error':'Não foi possível salvar. Tente novamente.'},503)
if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,default=8765);parser.add_argument('--no-browser',action='store_true');args=parser.parse_args()
 init();server=ThreadingHTTPServer(('127.0.0.1',args.port),Handler);url=f'http://localhost:{args.port}'
 print(f'Controle financeiro disponível em {url}',flush=True)
 if not args.no_browser:webbrowser.open(url)
 try:server.serve_forever()
 except KeyboardInterrupt:server.server_close()
