import sys,json,copy
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent))
from servidor import validate
s=json.loads((Path(__file__).resolve().parent.parent/'lib/initial-data.json').read_text(encoding='utf8'))
def entry(kind,cents):return dict(id=kind,kind=kind,cents=cents,month=10,description='Teste',category='',date='2026-10-06',paid=True,bank='')
s['records']=[entry('investment',10000),entry('investment_withdrawal',3000),entry('reserve',20000),entry('reserve_withdrawal',5000)]
assert validate(s)
t=copy.deepcopy(s);t['records'][1]['cents']=10001;assert not validate(t)
t=copy.deepcopy(s);t['records'][3]['cents']=20001;assert not validate(t)
s['records'][1]['cents']=10000;s['records'][3]['cents']=20000;assert validate(s)
print('OK: servidor aceita retiradas válidas e bloqueia valores superiores aos saldos.')
