import fs from 'node:fs';
function edit(path,replacements){let s=fs.readFileSync(path,'utf8');for(const [a,b] of replacements){if(!s.includes(a))throw Error('Missing source '+path+': '+a.slice(0,100));s=s.replaceAll(a,b);}fs.writeFileSync(path,s);}
edit('app/api/state/route.ts',[
 ['dateApproximate:z.boolean().optional()', 'dateApproximate:z.boolean().optional(),year:z.number().int().min(2000).max(2100).optional(),installmentGroup:z.string().max(100).optional(),installmentNumber:z.number().int().min(1).max(120).optional(),installmentCount:z.number().int().min(1).max(120).optional()'],
 ['monthStates:z.array(z.enum', "yearMonthStates:z.record(z.enum(['realizado','previsto'])).optional(),monthStates:z.array(z.enum"]
]);
edit('servidor.py',[
 [" records=s.get('records'); ids=set()", " states=s.get('yearMonthStates',{})\n if not isinstance(states,dict) or any(not isinstance(k,str) or v not in ['realizado','previsto'] for k,v in states.items()):return False\n records=s.get('records'); ids=set()"],
 ["  ids.add(r['id'])", "  ids.add(r['id'])\n  if 'year' in r and (not isinstance(r['year'],int) or not 2000<=r['year']<=2100):return False\n  for k in ['installmentNumber','installmentCount']:\n   if k in r and (not isinstance(r[k],int) or not 1<=r[k]<=120):return False\n  if 'installmentGroup' in r and (not isinstance(r['installmentGroup'],str) or len(r['installmentGroup'])>100):return False"]
]);
edit('app/finance-app.tsx',[
 ['investmentBalance,reserveBalance}', 'investmentBalance,reserveBalance,createInstallments,monthState}'],
 ["[month,setMonth]=useState(8)", "[month,setMonth]=useState(8),[viewYear,setViewYear]=useState(2026)"],
 ["r=>r.month===month", "r=>r.month===month&&(r.year??data.year)===viewYear"],
 ["r=>scope==='all'||data.monthStates[r.month-1]===scope", "r=>(r.year??data.year)===viewYear&&(scope==='all'||monthState(data,viewYear,r.month)===scope)"],
 ["r=>r.month===i+1", "r=>r.month===i+1&&(r.year??data.year)===viewYear"],
 ["r=>r.month===j+1", "r=>r.month===j+1&&(r.year??data.year)===viewYear"],
 ["{id:crypto.randomUUID(),month,kind:k", "{id:crypto.randomUUID(),year:viewYear,month,kind:k"],
 ['`${data!.year}-${String(month)', '`${viewYear}-${String(month)'],
 ['<ThemeToggle/>', '<label className="year-selector"><span>Ano</span><select aria-label="Ano do controle" value={viewYear} onChange={e=>setViewYear(Number(e.target.value))}>{Array.from(new Set([data.year,viewYear,Math.min(2100,viewYear+1),...data.records.map(r=>r.year??data.year)])).sort((a,b)=>a-b).map(y=><option key={y} value={y}>{y}</option>)}</select></label><ThemeToggle/>'],
 ['Exercício {data.year}', 'Exercício {viewYear}'],
 ['{data.year} · FINANÇAS PESSOAIS', '{viewYear} · FINANÇAS PESSOAIS'],
 ['data.monthStates[i]', 'monthState(data,viewYear,i+1)'],
 ['data.monthStates[month-1]', 'monthState(data,viewYear,month)'],
 ['n.monthStates[month-1]=e.target.value;', "if(viewYear===data.year)n.monthStates[month-1]=e.target.value;else n.yearMonthStates={...n.yearMonthStates,[`${viewYear}-${month}`]:e.target.value};"],
 ['{n} {data.year}', '{n} {viewYear}'],
 ['Finanças · {data.year}', 'Finanças · {viewYear}'],
 ["['Mês','Tipo'", "['Ano','Mês','Tipo'"],
 ['r=>[months[r.month-1]', 'r=>[r.year??data.year,months[r.month-1]'],
 ["r.recurringFrom?' · recorrente':''", "r.installmentCount?` · parcela ${r.installmentNumber}/${r.installmentCount}`:r.recurringFrom?' · recorrente':''"],
 ['submit={async r=>{await save(updateEntry(data,r));}}', 'submit={async (r,count)=>{await save(createInstallments(data,r,count));}}'],
 ['submit:(r:Entry)=>Promise<void>', 'submit:(r:Entry,count:number)=>Promise<void>'],
 ["[keepLink,setKeepLink]=useState(false)", "[keepLink,setKeepLink]=useState(false),[installments,setInstallments]=useState(1)"],
 ['dateApproximate:draft.date===entry.date?draft.dateApproximate:undefined});', 'dateApproximate:draft.date===entry.date?draft.dateApproximate:undefined},isExpense(draft)?installments:1);'],
 ['<label className="full">Descrição<input', '<label>Ano<input type="number" min="2000" max="2100" required value={draft.year??data.year} onChange={e=>set(\'year\',Number(e.target.value))}/></label>{isExpense(draft)&&!data.records.some(r=>r.id===entry.id)&&<label>Número de parcelas<input type="number" required min="1" max="120" step="1" value={installments} onChange={e=>setInstallments(Number(e.target.value))}/><small>Inclui o mês inicial. Cada mês recebe o valor informado abaixo.</small></label>}<label className="full">Descrição<input'],
 ["draft.kind==='investment'?'Valor do aporte (R$)':draft.kind.endsWith('_withdrawal')?'Valor da retirada (R$)':'Valor (R$)'", "draft.kind==='investment'?'Valor do aporte (R$)':draft.kind.endsWith('_withdrawal')?'Valor da retirada (R$)':isExpense(draft)&&installments>1?'Valor de cada parcela (R$)':'Valor (R$)'"],
 ['<div className="dialog-footer"><button type="button"', '{isExpense(draft)&&installments>1&&<p className="panel-note">{installments} parcelas de {currency(Math.round(Number(amount||0)*100))} · total {currency(Math.round(Number(amount||0)*100)*installments)}. As parcelas futuras serão criadas como pendentes. Cada parcela pode ser editada no seu mês.</p>}<div className="dialog-footer"><button type="button"'],
 ['Set–dez importados como previstos; altere no controle mensal.', 'Meses previstos são identificados no controle mensal.'],
 ['O patrimônio inclui todos os meses;', 'O patrimônio inclui todos os meses e anos;']
]);
