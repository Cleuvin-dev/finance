import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { emptyFinance } from './empty-finance';
import type { Finance } from './finance';

type FinancialRow = { payload: Finance; version: number; updated_at: string };

export class FinancialStorageError extends Error {
  constructor(public code: string | undefined, message: string) { super(message); }
}

function check(error: { code?: string; message: string } | null) {
  if (error) throw new FinancialStorageError(error.code, error.message);
}

// The client carries the verified user's JWT. RLS enforces ownership in Postgres.
export async function readFinance(client: SupabaseClient, userId: string): Promise<FinancialRow> {
  let result = await client.from('financial_accounts')
    .select('payload,version,updated_at').eq('user_id', userId).maybeSingle();
  check(result.error);
  if (!result.data) {
    const created = await client.from('financial_accounts').upsert(
      { user_id: userId, payload: emptyFinance() },
      { onConflict: 'user_id', ignoreDuplicates: true },
    );
    check(created.error);
    result = await client.from('financial_accounts')
      .select('payload,version,updated_at').eq('user_id', userId).single();
    check(result.error);
  }
  if (!result.data) throw new FinancialStorageError(undefined, 'Financial account unavailable');
  return result.data as FinancialRow;
}

export async function writeFinance(client: SupabaseClient, userId: string, state: Finance, version: number) {
  const result = await client.from('financial_accounts')
    .update({ payload: state }).eq('user_id', userId).eq('version', version)
    .select('version').maybeSingle();
  check(result.error);
  return result.data?.version as number | undefined;
}
