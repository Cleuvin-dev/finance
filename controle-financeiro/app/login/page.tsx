import AuthForm from '../auth-form';
import { redirect } from 'next/navigation';
import { serverSupabase } from '../../lib/supabase/server';
import { hasSupabaseConfig } from '../../lib/supabase/config';

export const dynamic = 'force-dynamic';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (hasSupabaseConfig()) {
    const client = await serverSupabase();
    const { data } = await client.auth.getUser();
    if (data.user) redirect('/');
  }
  const params = await searchParams;
  return <AuthForm mode="login" initialError={params.error === 'link'
    ? 'Esse link expirou ou já foi utilizado. Solicite um novo link ou entre na sua conta.' : ''}/>;
}
