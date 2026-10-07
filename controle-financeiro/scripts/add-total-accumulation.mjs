import fs from 'node:fs';
const file='app/finance-app.tsx';let s=fs.readFileSync(file,'utf8');
const before="{card('Patrimônio gerador de renda',wealth.total,Wallet,'Saldo inicial + investimentos lançados','highlight')}</div>";
if(!s.includes(before))throw Error('Investment summary not found');
s=s.replace(before,"{card('Patrimônio gerador de renda',wealth.total,Wallet,'Saldo inicial + investimentos lançados','highlight')}{card('Acúmulo total',reserved+wealth.total,PiggyBank,'Reserva + patrimônio gerador de renda','total-accumulation')}</div>");
s=s.replace('<div className="metrics">{card(\'Reserva acumulada\'', '<div className="metrics reserve-metrics">{card(\'Reserva acumulada\'');
s=s.replace('Math.min(100,data.wealthCents/goal*100)','Math.min(100,wealth.total/goal*100)');
fs.writeFileSync(file,s);
