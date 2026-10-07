import { NextResponse } from 'next/server';
import { serverSupabase } from '../../../lib/supabase/server';
import { authReturnPath } from '../../../lib/auth-redirect';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type');
  try {
    const client = await serverSupabase();
    const result = code ? await client.auth.exchangeCodeForSession(code)
      : tokenHash && (type === 'email' || type === 'signup' || type === 'recovery')
        ? await client.auth.verifyOtp({ token_hash: tokenHash, type }) : null;
    if (result && !result.error) {
      const path = type === 'recovery' ? '/nova-senha' : authReturnPath(url.searchParams.get('next'));
      return NextResponse.redirect(new URL(path, url.origin), { headers: { 'Cache-Control': 'private, no-store' } });
    }
  } catch { /* Invalid or expired links return to the login screen. */ }
  return NextResponse.redirect(new URL('/login?error=link', url.origin), { headers: { 'Cache-Control': 'private, no-store' } });
}
