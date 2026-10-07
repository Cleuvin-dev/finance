import FinanceApp from './finance-app';
import { redirect } from 'next/navigation';
import { serverSupabase } from '../lib/supabase/server';
import { hasSupabaseConfig } from '../lib/supabase/config';
import AccountMenu from './account-menu';

export const dynamic = 'force-dynamic';

export default async function Page() {
  if (!hasSupabaseConfig()) redirect('/login');
  const client = await serverSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) redirect('/login');
  return <FinanceApp key={data.user.id} accountKey={data.user.id} account={<AccountMenu email={data.user.email ?? 'Minha conta'} userId={data.user.id}/>}/>;
}
