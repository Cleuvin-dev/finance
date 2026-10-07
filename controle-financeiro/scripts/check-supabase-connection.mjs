import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('Configure the Supabase public environment variables first.');
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const settings = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key }, signal: AbortSignal.timeout(15000),
});
const auth = await settings.json();
console.log('Auth status:', settings.status);
if (settings.ok) console.log('Email enabled:', auth.external?.email, 'Signup disabled:', auth.disable_signup);
else console.log('Auth error:', auth.code ?? auth.msg ?? 'Unavailable');
// Request no rows and no financial values; only check anonymous access restrictions.
const result = await client.from('financial_accounts').select('user_id').limit(0);
console.log('Anonymous financial table check:', result.error?.code ?? 'Accessible (check RLS and grants)');
console.log('This check does not create users, change settings or migrate the database.');
