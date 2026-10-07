import AuthForm from '../auth-form';
import { redirect } from 'next/navigation';
import { serverSupabase } from '../../lib/supabase/server';
import { hasSupabaseConfig } from '../../lib/supabase/config';

export const dynamic = 'force-dynamic';
export default async function PasswordPage() {
  if (!hasSupabaseConfig()) redirect('/login');
  const client = await serverSupabase();
  const { data } = await client.auth.getUser();
  if (!data.user) redirect('/recuperar-senha');
  return <AuthForm mode="password"/>;
}
