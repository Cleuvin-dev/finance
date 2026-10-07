import fs from 'node:fs';let s=fs.readFileSync('app/finance-app.tsx','utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing source '+a.slice(0,80));s=s.replaceAll(a,b);}
replace('createInstallments,monthState}', 'createInstallments,monthState,savedMovement}');
replace('const reserveGoal=data.monthlyTargets.reduce', 'const savedInYear=savedMovement(data.records.filter(r=>(r.year??data.year)===viewYear));const reserveGoal=data.monthlyTargets.reduce');
replace('<h2>Depósitos e metas mensais</h2><span>{reserveGoal?(reserved/reserveGoal*100).toFixed(2):0}% concluídos</span>', '<h2>Aportes e metas mensais · {viewYear}</h2><span>{reserveGoal?(savedInYear/reserveGoal*100).toFixed(2):0}% concluídos</span>');
// Only this progress bar sits directly before the monthly contributions table.
replace('<div className="progress large"><div style={{width:`${Math.min(100,reserveGoal?reserved/reserveGoal*100:0)}%`}}/></div>', '<p className="panel-note">Esta meta considera os aportes em investimentos e na reserva, descontando retiradas e resgates do ano selecionado. O saldo inicial dos investimentos não é um aporte mensal.</p><div className="progress large"><div style={{width:`${Math.max(0,Math.min(100,reserveGoal?savedInYear/reserveGoal*100:0))}%`}}/></div>');
replace('<th>Depósitos − retiradas</th>', '<th>Reserva + investimentos − retiradas</th>');
replace('const deposit=reserveBalance(data.records.filter(r=>r.month===i+1&&(r.year??data.year)===viewYear)).total', 'const deposit=savedMovement(data.records.filter(r=>r.month===i+1&&(r.year??data.year)===viewYear))');
fs.writeFileSync('app/finance-app.tsx',s);
