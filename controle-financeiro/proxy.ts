import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabaseConfig, supabaseConfig } from './lib/supabase/config';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  if (hasSupabaseConfig()) {
    const { url, key } = supabaseConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          Object.entries(headers ?? {}).forEach(([name, value]) => response.headers.set(name, value));
        },
      },
    });
    // Verify and refresh cookies before the page or API validates the user.
    await supabase.auth.getClaims();
  }
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  return response;
}

export const config = {
  matcher: ['/', '/login', '/cadastro', '/recuperar-senha', '/nova-senha', '/auth/:path*', '/api/state'],
};
