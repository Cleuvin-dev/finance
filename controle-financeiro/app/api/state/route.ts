import { serverSupabase } from '../../../lib/supabase/server';
import { readFinance, writeFinance, FinancialStorageError } from '../../../lib/storage';
import { financeSchema } from '../../../lib/finance-schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const MAX_BYTES = 2_000_000;

function json(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

function unavailable(error: unknown) {
  // Keep provider details in server logs, never return financial data or tokens.
  console.error('Financial storage unavailable', error instanceof FinancialStorageError
    ? { code: error.code, message: error.message } : error instanceof Error ? error.message : 'Unknown error');
  const missingTable = error instanceof FinancialStorageError && ['PGRST205', '42P01'].includes(error.code ?? '');
  return json({ error: missingTable
    ? 'O banco do aplicativo ainda não foi preparado. Entre em contato com o responsável.'
    : 'Não foi possível acessar seus dados. Tente novamente em instantes.' }, 503);
}

export async function GET() {
  try {
    const client = await serverSupabase();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return json({ error: 'Sua sessão expirou. Entre novamente.' }, 401);
    const row = await readFinance(client, data.user.id);
    const state = financeSchema.parse(row.payload);
    return json({ state, version: row.version, updatedAt: row.updated_at, accountId: data.user.id });
  } catch (error) { return unavailable(error); }
}

export async function PUT(request: Request) {
  try {
    // Cookie-authenticated writes must originate from this application.
    if (request.headers.get('origin') !== new URL(request.url).origin) {
      return json({ error: 'Origem inválida.' }, 403);
    }
    const client = await serverSupabase();
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return json({ error: 'Sua sessão expirou. Entre novamente.' }, 401);
    if (Number(request.headers.get('content-length') || 0) > MAX_BYTES) {
      return json({ error: 'Arquivo muito grande.' }, 413);
    }
    const raw = await request.text();
    if (new TextEncoder().encode(raw).length > MAX_BYTES) return json({ error: 'Arquivo muito grande.' }, 413);
    let body: { state?: unknown; version?: number; accountId?: string };
    try { body = JSON.parse(raw); } catch { return json({ error: 'Dados inválidos.' }, 400); }
    if (!body || typeof body !== 'object') return json({ error: 'Dados inválidos.' }, 400);
    // Prevent a stale tab from saving one account's state into a newly signed-in account.
    // Ownership still comes only from the verified session, never from this hint.
    if (body.accountId !== data.user.id) return json({ error: 'Sua conta mudou. Recarregue a página antes de salvar.' }, 401);
    const parsed = financeSchema.safeParse(body.state);
    if (!parsed.success || !Number.isSafeInteger(body.version) || (body.version ?? 0) < 1 || (body.version ?? 0) >= 2_147_483_647) {
      return json({ error: 'Revise os valores informados.' }, 400);
    }
    const version = await writeFinance(client, data.user.id, parsed.data, body.version!);
    if (version === undefined) return json({ error: 'Os dados foram alterados em outra janela. Recarregue antes de salvar.' }, 409);
    return json({ version });
  } catch (error) { return unavailable(error); }
}
