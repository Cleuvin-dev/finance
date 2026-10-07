import 'server-only';

type QueryResult = {
  success: boolean;
  results: Record<string, unknown>[];
  meta: { changes: number };
};

// Legacy D1 adapter, retained for migration. The active API uses Supabase.
// Configuration is checked on each request, without contacting D1 during build.
export function storage() {
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  const database = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!account || !database || !token) throw new Error('D1 configuration missing');
  const url = `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(account)}/d1/database/${encodeURIComponent(database)}/query`;

  async function query(sql: string, params: unknown[]): Promise<QueryResult> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql, params }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`D1 request failed (${response.status})`);
    const body = await response.json() as { success: boolean; result?: QueryResult[] };
    const result = body.result?.[0];
    if (!body.success || !result?.success) throw new Error('D1 query failed');
    return result;
  }

  function statement(sql: string, params: unknown[] = []) {
    return {
      bind(...values: unknown[]) { return statement(sql, values); },
      run() { return query(sql, params); },
      async first<T>() {
        const result = await query(sql, params);
        return (result.results[0] as T | undefined) ?? null;
      },
    };
  }
  return { prepare: (sql: string) => statement(sql) };
}
