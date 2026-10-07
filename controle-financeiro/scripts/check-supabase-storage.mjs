import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';
import { PGlite } from '@electric-sql/pglite';

function load(file, dependencies = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const context = {
    exports: {}, Response, Request, TextEncoder, URL, Intl, Date, structuredClone,
    console: { error() {} },
    require(name) {
      if (name === 'server-only') return {};
      if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`);
      return dependencies[name];
    },
  };
  vm.runInNewContext(source, context, { filename: file });
  return context.exports;
}

const finance = load('lib/finance.ts');
const defaults = load('lib/empty-finance.ts');
const schema = load('lib/finance-schema.ts', { zod: { z }, './finance': finance });
const storage = load('lib/storage.ts', { './empty-finance': defaults });
const redirects = load('lib/auth-redirect.ts');
assert.equal(redirects.authReturnPath('https://evil.example'), '/');
assert.equal(redirects.authReturnPath('//evil.example'), '/');
assert.equal(redirects.authReturnPath('/nova-senha'), '/nova-senha');
assert(schema.financeSchema.safeParse(defaults.emptyFinance()).success);

const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const c = '33333333-3333-4333-8333-333333333333';
const db = new PGlite();
try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key);
    insert into auth.users values ('${a}'), ('${b}'), ('${c}');
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  const migration = fs.readFileSync('supabase/migrations/202610070001_financial_accounts.sql', 'utf8');
  await db.exec(migration);

  let currentUser = null;
  let forgedSession = false;
  async function asUser(id) {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? '']);
    await db.exec(`set role ${id ? 'authenticated' : 'anon'}`);
    currentUser = id;
  }
  // Emulates the Supabase Data API using a real PostgreSQL engine and RLS.
  function from(table) {
    assert.equal(table, 'financial_accounts');
    let changes;
    let columns = '*';
    const filters = [];
    const builder = {
      select(value) { columns = value; return builder; },
      eq(column, value) { assert(['user_id', 'version'].includes(column)); filters.push([column, value]); return builder; },
      update(value) { changes = value; return builder; },
      async upsert(value, options) {
        assert.equal(options.ignoreDuplicates, true);
        try {
          await db.query('insert into public.financial_accounts(user_id,payload) values ($1,$2::jsonb) on conflict(user_id) do nothing',
            [value.user_id, JSON.stringify(value.payload)]);
          return { data: null, error: null };
        } catch (error) { return { data: null, error }; }
      },
      async maybeSingle() {
        const values = changes ? [JSON.stringify(changes.payload)] : [];
        const clauses = filters.map(([column, value]) => { values.push(value); return `${column}=$${values.length}`; });
        assert(/^[a-z_,]+$|^\*$/.test(columns));
        const sql = changes
          ? `update public.financial_accounts set payload=$1::jsonb where ${clauses.join(' and ')} returning ${columns}`
          : `select ${columns} from public.financial_accounts where ${clauses.join(' and ')}`;
        try {
          const result = await db.query(sql, values);
          return { data: result.rows[0] ?? null, error: null };
        } catch (error) { return { data: null, error }; }
      },
      single() { return builder.maybeSingle(); },
    };
    return builder;
  }
  const client = { from, auth: { getUser: async () => ({
    data: { user: currentUser && !forgedSession ? { id: currentUser } : null },
    error: forgedSession ? new Error('Invalid JWT') : null,
  }) } };
  const api = load('app/api/state/route.ts', {
    '../../../lib/supabase/server': { serverSupabase: async () => client },
    '../../../lib/storage': storage,
    '../../../lib/finance-schema': schema,
  });
  const request = (state, version, accountId = currentUser, origin = 'https://finance.test') =>
    new Request('https://finance.test/api/state', {
      method: 'PUT', headers: { origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ state, version, accountId }),
    });

  await asUser(null);
  assert.equal((await api.GET()).status, 401);
  assert.equal((await api.PUT(request(defaults.emptyFinance(), 1))).status, 401);
  await assert.rejects(db.query('select * from public.financial_accounts'), /permission denied/);

  await asUser(a);
  forgedSession = true;
  assert.equal((await api.GET()).status, 401);
  forgedSession = false;
  let result = await api.GET();
  assert.equal(result.status, 200);
  assert.match(result.headers.get('Cache-Control'), /private, no-store/);
  const first = await result.json();
  assert.equal(first.accountId, a);
  assert.equal(first.version, 1);
  assert.equal(first.state.records.length, 0);
  assert.equal(first.state.sourceSheets.length, 0);
  const state = first.state;
  state.records.push({ id: 'income-a', month: 1, kind: 'income', description: 'Own income',
    category: '', date: '', cents: 12345, paid: true, bank: '' });
  result = await api.PUT(request(state, 1));
  assert.equal(result.status, 200);
  assert.equal((await result.json()).version, 2);
  assert.equal((await api.PUT(request(state, 1))).status, 409);
  assert.equal((await api.PUT(request(state, 2, b))).status, 401);
  assert.equal((await api.PUT(request(state, 2, a, 'https://evil.example'))).status, 403);
  assert.equal((await api.PUT(request({ ...state, allocation: [60, 30, 20] }, 2))).status, 400);
  assert.equal((await api.PUT(request({ ...state, records: [...state.records, state.records[0]] }, 2))).status, 400);
  assert.equal((await api.PUT(request({ ...state, wealthCents: -1 }, 2))).status, 400);
  assert.equal((await api.PUT(new Request('https://finance.test/api/state', {
    method: 'PUT', headers: { origin: 'https://finance.test' }, body: '{',
  }))).status, 400);
  assert.equal((await api.PUT(new Request('https://finance.test/api/state', {
    method: 'PUT', headers: { origin: 'https://finance.test' }, body: 'x'.repeat(2_000_001),
  }))).status, 413);

  await asUser(b);
  const second = await (await api.GET()).json();
  assert.equal(second.accountId, b);
  assert.equal(second.state.records.length, 0);
  assert.equal((await db.query('select user_id from public.financial_accounts')).rows.length, 1);
  assert.equal((await db.query('select payload from public.financial_accounts where user_id=$1', [a])).rows.length, 0);
  assert.equal(await storage.writeFinance(client, a, defaults.emptyFinance(), 2), undefined);
  await assert.rejects(db.query('insert into public.financial_accounts(user_id,payload) values ($1,$2::jsonb)',
    [c, JSON.stringify(defaults.emptyFinance())]), /row-level security/);
  await assert.rejects(db.query('update public.financial_accounts set user_id=$1 where user_id=$2', [c, b]), /permission denied/);
  await assert.rejects(db.query('update public.financial_accounts set version=100 where user_id=$1', [b]), /permission denied/);
  await assert.rejects(db.query('delete from public.financial_accounts where user_id=$1', [b]), /permission denied/);
  assert.equal((await api.PUT(request(state, 2, a))).status, 401);

  await asUser(a);
  const saved = await (await api.GET()).json();
  assert.equal(saved.state.records[0].cents, 12345);
  assert.equal(saved.version, 2);
  assert.equal((await db.query('select created_at <= updated_at as valid from public.financial_accounts')).rows[0].valid, true);

  await db.exec('reset role');
  await db.exec(migration); // Reapplying the migration preserves data.
  await asUser(a);
  assert.equal((await (await api.GET()).json()).state.records[0].cents, 12345);
  console.log('OK: PostgreSQL RLS, two-user isolation, anonymous/forged-session denial, empty accounts, concurrent saves, payload validation and migration reapplication.');
} finally { await db.close(); }
