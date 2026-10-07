import fs from 'node:fs';
function edit(path,replacements){let s=fs.readFileSync(path,'utf8');for(const [before,after] of replacements){if(!s.includes(before))throw Error('Missing text '+path+': '+before.slice(0,70));s=s.replaceAll(before,after);}fs.writeFileSync(path,s);}
edit('app/api/state/route.ts',[
 ["import {z} from 'zod';","import {z} from 'zod';\nimport {investmentBalance,reserveBalance} from '../../../lib/finance';"],
 ["'income','investment','reserve']","'income','investment','reserve','investment_withdrawal','reserve_withdrawal']"],
 ["'IDs duplicados');","'IDs duplicados').refine(s=>investmentBalance(s).total>=0 && reserveBalance(s.records).total>=0,'A retirada não pode superar o saldo disponível.');"]
]);
edit('servidor.py',[
 ["'income','investment','reserve']","'income','investment','reserve','investment_withdrawal','reserve_withdrawal']"],
 [' return True\nclass Handler', " investment=s['wealthCents']+sum(r['cents'] if r['kind']=='investment' else -r['cents'] if r['kind']=='investment_withdrawal' else 0 for r in records)\n reserve=sum(r['cents'] if r['kind']=='reserve' else -r['cents'] if r['kind']=='reserve_withdrawal' else 0 for r in records)\n if investment<0 or reserve<0:return False\n return True\nclass Handler"]
]);
edit('app/finance-app.tsx',[
 ['updateEntry,investmentBalance}', 'updateEntry,investmentBalance,reserveBalance}'],
 ["const reserved=data.records.filter(r=>r.kind==='reserve').reduce((t,r)=>t+r.cents,0)","const reserved=reserveBalance(data.records).total"],
 ["['income','investment','reserve'].includes", "['income','investment','reserve','investment_withdrawal','reserve_withdrawal'].includes"],
 ["secondary?:string,style='')", "secondary?:string,style='',action?:()=>void,actionLabel='')"],
 ['{secondary&&<small>{secondary}</small>}</div>;}', '{secondary&&<small>{secondary}</small>}{action&&<button type="button" className="outline metric-action" disabled={saving} onClick={action}>{actionLabel}</button>}</div>;}'],
 ["card('Reserva acumulada',reserved,PiggyBank)","card('Reserva acumulada',reserved,PiggyBank,undefined,'',()=>newEntry('reserve_withdrawal'),'Retirar da reserva')"],
 ["card('Patrimônio gerador de renda',wealth.total,Wallet,'Saldo inicial + investimentos lançados','highlight')", "card('Patrimônio gerador de renda',wealth.total,Wallet,'Saldo inicial + aportes − resgates','highlight',()=>newEntry('investment_withdrawal'),'Resgatar investimento')"],
 ['<span>Patrimônio acompanhado nas metas</span>', '<span>Resgates de investimentos</span><strong>{currency(wealth.withdrawals)}</strong></div><div className="summary-row"><span>Patrimônio acompanhado nas metas</span>'],
 ['Depósitos na reserva atualizam apenas a reserva.', 'Depósitos na reserva atualizam apenas a reserva. Retiradas e resgates reduzem o saldo correspondente e voltam ao caixa do mês selecionado. Registre separadamente qualquer despesa paga com esse dinheiro.'],
 ["const deposit=data.records.filter(r=>r.kind==='reserve'&&r.month===i+1).reduce((t,r)=>t+r.cents,0)","const deposit=reserveBalance(data.records.filter(r=>r.month===i+1)).total"],
 ['<th>Depositado</th>', '<th>Depósitos − retiradas</th>'],
 ["r.kind==='income'?'Recebido':'Aportado'", "r.kind==='income'?'Recebido':r.kind.endsWith('_withdrawal')?'Resgatado':'Aportado'"],
 ['<span>Aportes do período</span><strong>{currency(a.invested)}</strong></div>', '<span>Aportes do período</span><strong>{currency(a.invested)}</strong></div><div className="summary-row"><span>Retiradas e resgates</span><strong>{currency(a.withdrawn)}</strong></div>'],
 ['<span>Compromissos pendentes</span>', '<span>Retiradas e resgates recebidos</span><strong>{currency(m.withdrawn)}</strong></div><div className="summary-row"><span>Compromissos pendentes</span>'],
 ['<th>Aportes</th><th>Saldo após compromissos</th>', '<th>Aportes</th><th>Retiradas / resgates</th><th>Saldo após compromissos</th>'],
 ['r.pending,r.invested,r.available', 'r.pending,r.invested,r.withdrawn,r.available'],
 ["'Receitas − despesas − aportes'", "'Receitas − despesas − aportes + resgates'"],
 ['Caixa antes de quitar pendências</span>', 'Caixa antes de quitar pendências</span>'],
 ['Rendimentos e resgates não são calculados automaticamente.', 'Os resgates lançados são descontados automaticamente. Rendimentos não são calculados automaticamente.'],
 ["['Caixa registrado','Receitas − despesas pagas − aportes']", "['Caixa registrado','Receitas − despesas pagas − aportes + retiradas e resgates']"],
 ["['Saldo após compromissos','Receitas − todas as despesas − aportes']", "['Saldo após compromissos','Receitas − todas as despesas − aportes + retiradas e resgates']"],
 ['Informe quanto você está aplicando neste lançamento, não o saldo total que já possui.', 'Informe quanto você está aplicando neste lançamento, não o saldo total que já possui.'],
 ['const cents=Math.round(Number(amount)*100);if(!Number.isFinite(cents)||cents<0)return;submit({...draft,cents,', "const cents=Math.round(Number(amount)*100);if(!Number.isFinite(cents)||cents<0)return;const candidate=updateEntry(data,{...draft,cents});if(investmentBalance(candidate).total<0||reserveBalance(candidate.records).total<0){setFormError('A retirada não pode superar o saldo disponível.');return;}setFormError('');submit({...draft,cents,"],
 ['const initialVersion=useRef(version);', "const [formError,setFormError]=useState('');const initialVersion=useRef(version);"],
 ['{error&&<p className="error" role="alert">{error}</p>}', '{(error||formError)&&<p className="error" role="alert">{formError||error}</p>}'],
 ["{draft.kind==='investment'?'Valor do aporte (R$)':'Valor (R$)'}", "{draft.kind==='investment'?'Valor do aporte (R$)':draft.kind.endsWith('_withdrawal')?'Valor da retirada (R$)':'Valor (R$)'}{draft.kind.endsWith('_withdrawal')&&<small>A retirada reduz o saldo guardado e adiciona o valor ao caixa do mês, sem ser classificada como receita.</small>}"],
 ['let dummy', 'let dummy']
].filter(([a,b])=>a!==b));
