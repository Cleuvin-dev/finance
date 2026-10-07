import fs from 'node:fs';const path='app/finance-app.tsx';let s=fs.readFileSync(path,'utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing source '+a.slice(0,100));s=s.replaceAll(a,b);}
replace(' function switchMonth(n:number)', ` function removeRegistration(list:'banks'|'cards'|'categories',value:string){if(saving)return;if(!confirm(\`Remover "\${value}" dos cadastros disponíveis? Os lançamentos existentes serão mantidos.\`))return;const next=structuredClone(data!);next[list]=next[list].filter(item=>item!==value);save(next);}
 function registrationChip(list:'banks'|'cards'|'categories',value:string){return <span className="registration-chip" key={value}>{value}<button type="button" disabled={saving} aria-label={\`Remover \${list==='banks'?'banco':list==='cards'?'cartão':'categoria'} \${value}\`} title={\`Remover \${value}\`} onClick={()=>removeRegistration(list,value)}><X size={15}/></button></span>;}
 function switchMonth(n:number)`);
replace('data.banks.map(b=><span key={b}>{b}</span>)', "data.banks.map(b=>registrationChip('banks',b))");
replace('data.cards.map(b=><span key={b}>{b}</span>)', "data.cards.map(b=>registrationChip('cards',b))");
replace('data.categories.map(b=><span key={b}>{b}</span>)', "data.categories.map(b=>registrationChip('categories',b))");
replace('<h2>Cadastros disponíveis</h2><div className="two-columns">', '<h2>Cadastros disponíveis</h2><p>Use o × ao lado de um item para removê-lo. Os lançamentos antigos mantêm seu banco, cartão ou categoria.</p><div className="two-columns">');
fs.writeFileSync(path,s);
