import fs from 'node:fs';const file='app/finance-app.tsx';let s=fs.readFileSync(file,'utf8');
const before='className={`metric ${style}`}';
const after="className={`metric ${style} ${label==='Recebimentos'?'metric-income':label==='Despesas'?'metric-expense':''}`}";
if(!s.includes(before))throw Error('Metric component not found');fs.writeFileSync(file,s.replace(before,after));
