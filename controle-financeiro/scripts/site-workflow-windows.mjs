// Windows runtime cannot create child-process output pipes. Capture Git output
// through temporary file handles while preserving the official Sites workflow.
import childProcess from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {PassThrough} from 'node:stream';
const original=childProcess.spawn;
childProcess.spawn=function(command,args,options){
 if(command!=='git'||!Array.isArray(options?.stdio)||options.stdio[1]!=='pipe')return original(command,args,options);
 const dir=fs.mkdtempSync(path.resolve('.sites-runtime/git-output-'));
 const paths=[path.join(dir,'stdout'),path.join(dir,'stderr')];
 const handles=paths.map(p=>fs.openSync(p,'w+'));
 const child=original(command,args,{...options,stdio:[options.stdio[0],...handles]});
 const streams=paths.map(()=>new PassThrough());
 child.stdout=streams[0];child.stderr=streams[1];
 child.once('close',()=>{handles.forEach(fd=>fs.closeSync(fd));paths.forEach((p,i)=>streams[i].end(fs.readFileSync(p)));paths.forEach(p=>fs.unlinkSync(p));fs.rmdirSync(dir);});
 return child;
};
syncBuiltinESMExports();
await import('file:///C:/Users/supor/.codex/plugins/cache/openai-curated-remote/sites/0.1.75/scripts/site-workflow.mjs');
