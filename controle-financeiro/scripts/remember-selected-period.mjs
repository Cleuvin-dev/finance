import fs from 'node:fs';const file='app/finance-app.tsx';let s=fs.readFileSync(file,'utf8');
const marker=' async function load(){';
if(!s.includes(marker))throw Error('Period initialization not found');
const hooks=` const [periodRestored,setPeriodRestored]=useState(false);
 useEffect(()=>{try{const stored=localStorage.getItem('financas-selected-period');if(stored){const period=JSON.parse(stored);if(Number.isInteger(period.month)&&period.month>=1&&period.month<=12)setMonth(period.month);if(Number.isInteger(period.year)&&period.year>=2000&&period.year<=2100)setViewYear(period.year);}}catch{}setPeriodRestored(true);},[]);
 useEffect(()=>{if(!periodRestored)return;try{localStorage.setItem('financas-selected-period',JSON.stringify({month,year:viewYear}));}catch{}},[month,viewYear,periodRestored]);
`;
s=s.replace(marker,hooks+marker);fs.writeFileSync(file,s);
