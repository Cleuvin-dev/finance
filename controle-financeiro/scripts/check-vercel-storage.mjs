import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Isolate the server-only module with fake credentials and an HTTP stub.
const source = readFileSync(new URL('../lib/storage.ts', import.meta.url), 'utf8')
  .replace("import 'server-only';", '');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
let calls = [];
let response = { success: true, result: [{ success: true, results: [{ version: 2 }], meta: { changes: 1 } }] };
let status = 200;
const context = {
  exports: {},
  process: { env: {} },
  AbortSignal,
  encodeURIComponent,
  fetch: async (url, options) => {
    calls.push({ url, options });
    return { ok: status === 200, status, json: async () => response };
  },
};
vm.runInNewContext(compiled, context);
const { storage } = context.exports;
assert.throws(() => storage(), /configuration missing/);
assert.equal(calls.length, 0);
context.process.env = {
  CLOUDFLARE_ACCOUNT_ID: 'test-account',
  CLOUDFLARE_D1_DATABASE_ID: 'test-database',
  CLOUDFLARE_API_TOKEN: 'test-token',
};
const db = storage();
const first = await db.prepare('SELECT version FROM financial_state WHERE id=?').bind('main').first();
assert.equal(first.version, 2);
assert.equal(calls[0].url, 'https://api.cloudflare.com/client/v4/accounts/test-account/d1/database/test-database/query');
assert.equal(calls[0].options.headers.Authorization, 'Bearer test-token');
assert.equal(calls[0].options.cache, 'no-store');
assert.deepEqual(JSON.parse(calls[0].options.body), {
  sql: 'SELECT version FROM financial_state WHERE id=?', params: ['main'],
});
assert.equal((await db.prepare('UPDATE financial_state SET version=?').bind(3).run()).meta.changes, 1);
response.result[0].results = [];
assert.equal(await db.prepare('SELECT version FROM financial_state').first(), null);
response.result[0].meta.changes = 0;
assert.equal((await db.prepare('UPDATE financial_state SET version=?').bind(4).run()).meta.changes, 0);
status = 403;
await assert.rejects(db.prepare('SELECT 1').run(), /failed \(403\)/);
status = 200;
response = { success: false, result: [] };
await assert.rejects(db.prepare('SELECT 1').run(), /query failed/);
response = { success: true, result: [{ success: false }] };
await assert.rejects(db.prepare('SELECT 1').run(), /query failed/);
console.log('Vercel D1 adapter checks passed (mock HTTP; no live database accessed).');
