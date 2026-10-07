import fs from 'node:fs';
const file='app/finance-app.tsx';let s=fs.readFileSync(file,'utf8');
const marker=" const selected=data.records.filter";
if(!s.includes(marker))throw Error('Source not found');
s=s.replace(marker," const allocationLabel=`Método ${data.allocation.map(value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:2}).format(value)).join('/')}`;const navigation=nav.map(([id,label,Icon])=>[id,id==='allocation'?allocationLabel:label,Icon] as const);\n"+marker);
s=s.replaceAll('nav.map(([id,label,Icon])','navigation.map(([id,label,Icon])').replaceAll('nav.find(n=>n[0]===tab)','navigation.find(n=>n[0]===tab)');
// The source of the derived navigation remains the constant reference list.
s=s.replace('const navigation=navigation.map(', 'const navigation=nav.map(');
fs.writeFileSync(file,s);
