from pathlib import Path
import sqlite3,json,datetime
base=Path(__file__).resolve().parent.parent
db=sqlite3.connect(base/'dados-financeiros.sqlite3',timeout=10)
backup=base/('backup-antes-zerar-reserva-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'.sqlite3')
with sqlite3.connect(backup) as target: db.backup(target)
with db:
 db.execute('BEGIN IMMEDIATE')
 payload,version=db.execute('SELECT payload,version FROM financial_state WHERE id=?',('main',)).fetchone()
 state=json.loads(payload)
 removed=[r for r in state['records'] if r['kind']=='reserve']
 state['records']=[r for r in state['records'] if r['kind']!='reserve']
 db.execute('UPDATE financial_state SET payload=?,version=version+1,updated_at=? WHERE id=? AND version=?',(json.dumps(state,ensure_ascii=False),datetime.datetime.now(datetime.timezone.utc).isoformat(),'main',version))
 print(json.dumps({'reserveCents':sum(r['cents'] for r in state['records'] if r['kind']=='reserve'),'removedDeposits':len(removed),'removedCents':sum(r['cents'] for r in removed),'investmentCents':sum(r['cents'] for r in state['records'] if r['kind']=='investment'),'backup':backup.name}))
initial=base/'lib/initial-data.json'
seed=json.loads(initial.read_text(encoding='utf8'));seed['records']=[r for r in seed['records'] if r['kind']!='reserve'];initial.write_text(json.dumps(seed,ensure_ascii=False,indent=2),encoding='utf8')
