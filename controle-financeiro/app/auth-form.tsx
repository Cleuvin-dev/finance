'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, Wallet } from 'lucide-react';
import { browserSupabase } from '../lib/supabase/client';
import { hasSupabaseConfig } from '../lib/supabase/config';
import ThemeToggle from './theme-toggle';

type Mode = 'login' | 'signup' | 'reset' | 'password';
const copy = {
  login: { title: 'Seu controle começa aqui.', description: 'Entre para acompanhar suas finanças em um espaço só seu.', button: 'Entrar na minha conta' },
  signup: { title: 'Crie o seu espaço.', description: 'Uma conta para organizar seu dinheiro e acompanhar seus objetivos.', button: 'Criar minha conta' },
  reset: { title: 'Vamos recuperar seu acesso.', description: 'Informe seu e-mail para receber um link de recuperação de senha.', button: 'Enviar link de recuperação' },
  password: { title: 'Escolha sua nova senha.', description: 'Use uma senha exclusiva para proteger seu controle financeiro.', button: 'Salvar nova senha' },
};

function authError(code?: string) {
  if (code === 'invalid_credentials') return 'E-mail ou senha incorretos.';
  if (code === 'email_not_confirmed') return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (code === 'weak_password') return 'Escolha uma senha mais forte, com pelo menos 8 caracteres.';
  if (code === 'same_password') return 'A nova senha deve ser diferente da senha atual.';
  if (code === 'signup_disabled') return 'O cadastro de contas está temporariamente indisponível.';
  if (code === 'email_address_not_authorized') return 'O envio de e-mails ainda está sendo configurado. Entre em contato com o responsável.';
  return 'Não foi possível concluir. Confira os dados e tente novamente.';
}

export default function AuthForm({ mode, initialError = '' }: { mode: Mode; initialError?: string }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState('');
  const configured = hasSupabaseConfig();
  const text = copy[mode];
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError(''); setNotice('');
    if ((mode === 'signup' || mode === 'password') && password !== confirmation) {
      setError('As senhas precisam ser iguais.'); return;
    }
    setBusy(true);
    try {
      const client = browserSupabase();
      const origin = window.location.origin;
      if (mode === 'login') {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setError(authError(error.code)); return; }
        window.location.replace('/');
      } else if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(), password,
          options: { data: { display_name: name.trim() }, emailRedirectTo: `${origin}/auth/callback` },
        });
        if (error) { setError(authError(error.code)); return; }
        setPassword(''); setConfirmation('');
        if (data.session) window.location.replace('/');
        else setNotice('Confira seu e-mail para confirmar o cadastro. Depois, entre na sua conta.');
      } else if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?next=/nova-senha`,
        });
        if (error) { setError(authError(error.code)); return; }
        setNotice('Se houver uma conta com esse e-mail, você receberá um link para redefinir sua senha.');
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) { setError(authError(error.code)); return; }
        setPassword(''); setConfirmation('');
        window.location.replace('/');
      }
    } catch { setError('Não foi possível conectar. Verifique sua conexão e tente novamente.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-shell">
    <section className="auth-story" aria-label="Finanças pessoais">
      <Link className="brand auth-brand" href="/login"><div className="brandmark">F</div><span>finanças<span className="brand-sub">CONTROLE PESSOAL</span></span></Link>
      <div className="auth-story-copy"><span className="eyebrow">UM ESPAÇO PARA O SEU DINHEIRO</span>
        <h1>Organize hoje.<br/>Construa o amanhã.</h1>
        <p>Recebimentos, gastos e objetivos reunidos para você acompanhar cada passo.</p>
        <div className="auth-benefit"><Wallet size={23}/><span>Seu controle financeiro, em qualquer lugar.</span></div>
        <div className="auth-benefit"><ShieldCheck size={23}/><span>Uma conta individual para seus lançamentos.</span></div>
      </div><span className="auth-story-foot">Mais clareza para cuidar do que importa.</span>
    </section>
    <section className="auth-main"><div className="auth-theme"><ThemeToggle/></div>
      <div className="auth-card"><span className="eyebrow">{mode === 'signup' ? 'NOVA CONTA' : mode === 'login' ? 'BEM-VINDO' : 'SEU ACESSO'}</span>
        <h2>{text.title}</h2><p>{text.description}</p>
        {!configured && <p className="error" role="alert">O acesso está sendo configurado. Tente novamente mais tarde.</p>}
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && <label>Seu nome<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" maxLength={80} required placeholder="Como podemos chamar você?"/></label>}
          {mode !== 'password' && <label>E-mail<div className="auth-input"><Mail size={18}/><input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required maxLength={254} placeholder="voce@exemplo.com"/></div></label>}
          {mode !== 'reset' && <label>{mode === 'password' ? 'Nova senha' : 'Senha'}<div className="auth-input"><LockKeyhole size={18}/><input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'login' ? undefined : 8} maxLength={128} required placeholder={mode === 'login' ? 'Sua senha' : 'Pelo menos 8 caracteres'}/></div></label>}
          {(mode === 'signup' || mode === 'password') && <label>Confirme a senha<input type="password" value={confirmation} onChange={e => setConfirmation(e.target.value)} autoComplete="new-password" minLength={8} maxLength={128} required placeholder="Digite a senha novamente"/></label>}
          {mode === 'login' && <Link className="auth-forgot" href="/recuperar-senha">Esqueci minha senha</Link>}
          {error && <p className="error" role="alert">{error}</p>}
          {notice && <p className="auth-notice" role="status">{notice}</p>}
          <button className="primary auth-submit" disabled={busy || !configured}>{busy ? 'Aguarde…' : text.button}<ArrowRight size={18}/></button>
        </form>
        <div className="auth-links">{mode === 'login' ? <>Ainda não tem uma conta? <Link href="/cadastro">Criar conta</Link></> : <Link href="/login">Voltar para o login</Link>}</div>
        <p className="auth-footnote"><ShieldCheck size={15}/>Seu controle pertence à sua conta.</p>
      </div>
    </section>
  </main>;
}
