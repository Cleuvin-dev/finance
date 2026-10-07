import fs from 'node:fs';
const path='app/finance-app.tsx';let s=fs.readFileSync(path,'utf8');
s=s.replace('entry={editing} data={data} saving={saving}', 'entry={editing} data={data} error={error} saving={saving}');
s=s.replace('function EntryForm({entry,data,saving,close,submit,onSavedClose,version}:','function EntryForm({entry,data,error,saving,close,submit,onSavedClose,version}:');
s=s.replace('entry:Entry;data:Finance;saving:boolean;close:', 'entry:Entry;data:Finance;error:string;saving:boolean;close:');
s=s.replace('<div className="dialog-footer"><button type="button"', '{error&&<p className="error" role="alert">{error}</p>}<div className="dialog-footer"><button type="button"');
fs.writeFileSync(path,s);
