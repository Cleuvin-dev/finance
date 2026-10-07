'use client';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { browserSupabase } from '../lib/supabase/client';

export default function AccountMenu({ email, userId }: { email: string; userId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const { data } = browserSupabase().auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') window.location.replace('/login');
      else if (session && session.user.id !== userId) window.location.replace('/');
    });
    return () => data.subscription.unsubscribe();
  }, [userId]);
  async function logout() {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { error } = await browserSupabase().auth.signOut({ scope: 'local' });
      if (error) throw error;
      window.location.replace('/login');
    } catch { setError('Não foi possível sair. Tente novamente.'); setBusy(false); }
  }
  return <div className="account-menu"><span title={email}>{email}</span>
    <button className="outline" onClick={logout} disabled={busy}><LogOut size={16}/>{busy ? 'Saindo…' : 'Sair'}</button>
    {error && <small role="alert">{error}</small>}</div>;
}
