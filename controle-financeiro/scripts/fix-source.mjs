import fs from 'node:fs';
const changes={
 'app/api/state/route.ts':[['const body=await request.json();','const body=await request.json() as {state:unknown;version:number};']],
 'app/finance-app.tsx':[['const b=await r.json();','const b=await r.json() as {error:string;state:Finance;version:number};']],
 'app/layout.tsx':[['/favicon.svg','/finance-favicon.svg']]
};
for(const [path,edits] of Object.entries(changes)){let s=fs.readFileSync(path,'utf8');for(const [a,b] of edits)s=s.replaceAll(a,b);fs.writeFileSync(path,s);}
