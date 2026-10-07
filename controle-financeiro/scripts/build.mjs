if(process.argv.includes('--local')){
 const {build}=await import('vite');
 const {default:react}=await import('@vitejs/plugin-react');
 await build({configFile:false,root:'local-preview',publicDir:'../public',plugins:[react()],build:{outDir:'../local-dist',emptyOutDir:true}});
}else{
 process.argv=[process.argv[0],'scripts/run-framework.mjs','build',...process.argv.slice(2)];
 await import('./run-framework.mjs');
}
