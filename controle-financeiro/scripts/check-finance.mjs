import fs from 'node:fs';
import assert from 'node:assert/strict';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync('lib/finance.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const {totals,status,updateEntry}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const d=JSON.parse(fs.readFileSync('lib/initial-data.json','utf8'));
assert.equal(d.records.length,126);
const r=totals(d.records.filter(r=>r.month<=8));assert.deepEqual(r,{income:3428900,expense:2869700,paid:2846100,pending:23600,invested:0,withdrawn:0,cash:582800,available:559200});
assert.equal(totals(d.records.filter(r=>r.month===8)).cash,75400);
assert.equal(totals(d.records.filter(r=>r.month===8)).available,51800);
assert.equal(status({paid:true,date:'2026-01-10'},'2026-10-06'),'Pago');
assert.equal(status({paid:false,date:'2026-01-10'},'2026-10-06'),'Vencido');
assert.equal(status({paid:false,date:'2026-10-07'},'2026-10-06'),'Vence em 1 dias');
assert.equal(status({paid:false,date:''},'2026-10-06'),'Sem data');
const aug=d.records.find(r=>r.id==='8-fixed-13');const next=updateEntry(d,{...aug,cents:20000});assert.equal(next.records.find(r=>r.id==='12-fixed-13').cents,20000);assert.equal(d.records.find(r=>r.id==='8-fixed-13').cents,19000);
for(let m=1;m<=12;m++){const x=totals(d.records.filter(r=>r.month===m));assert.equal(x.cash-x.pending,x.available);}
assert.equal(12*d.essentialMonthlyCents,2268000);
console.log('OK: importação, conciliação mensal, reserva, pagamentos, vencimentos e recorrência.');
