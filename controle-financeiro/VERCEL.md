# Vercel + Supabase

O aplicativo utiliza Next.js na Vercel, Supabase Auth para contas e PostgreSQL com Row Level Security (RLS) para separar os dados financeiros. A configuração anterior de D1 está arquivada em `lib/storage-d1.ts` e não é utilizada pela API atual. A versão Python/SQLite local continua independente.

## 1. Preparar o banco

Projeto Supabase: `znkteksinhmfsaozaznj`.

Abra o [SQL Editor do projeto](https://supabase.com/dashboard/project/znkteksinhmfsaozaznj/sql/new), copie o conteúdo de [`supabase/migrations/202610070001_financial_accounts.sql`](supabase/migrations/202610070001_financial_accounts.sql) e execute.

A chave pública não possui permissão para executar migrações ou administrar o projeto. O SQL foi validado em PostgreSQL local de teste; isso não significa que já foi aplicado ao projeto remoto.

### Tabelas e atributos

As contas, e-mails, senhas e sessões são administrados pelo Supabase Auth. O nome informado no cadastro fica em `auth.users.raw_user_meta_data.display_name`; esse dado serve para apresentação, nunca para autorizar acesso.

Os dados do aplicativo ficam em `public.financial_accounts`:

| Coluna | Tipo | Responsabilidade |
| --- | --- | --- |
| `user_id` | UUID, chave primária | Proprietário, vinculado a `auth.users.id`. |
| `payload` | JSONB | Lançamentos, categorias, bancos, cartões, percentuais, metas e saldos iniciais. |
| `version` | Integer | Controle de gravações concorrentes, iniciado em 1. |
| `created_at` | Timestamp com fuso | Data de criação da conta financeira. |
| `updated_at` | Timestamp com fuso | Data da última gravação. |

O JSONB preserva o formato atual do aplicativo. Os campos financeiros são validados por `lib/finance-schema.ts`. Uma trigger aumenta a versão e atualiza a data em cada gravação.

As políticas permitem leitura, criação e alteração apenas quando `auth.uid()` corresponde ao `user_id` da linha. Usuários anônimos não recebem acesso à tabela. Usuários autenticados não podem trocar o proprietário, editar a versão diretamente ou excluir a conta financeira pela Data API.

## 2. Configurar a autenticação

Em **Authentication → URL Configuration**, configure:

**Site URL**

```text
https://finance-mada.vercel.app
```

**Redirect URLs**

```text
https://finance-mada.vercel.app/auth/callback
https://finance-mada.vercel.app/auth/callback?next=/nova-senha
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?next=/nova-senha
```

Mantenha o provedor **Email** e a confirmação de e-mail habilitados. O aplicativo tem cadastro, login, recuperação de senha e saída da conta.

Para permitir abrir o link de confirmação em outro navegador, configure os templates em **Authentication → Email Templates**:

**Confirm signup**

```html
<h2>Confirme sua conta no Finanças</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirmar minha conta</a></p>
```

**Reset password**

```html
<h2>Recupere seu acesso ao Finanças</h2>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/nova-senha">Escolher nova senha</a></p>
```

Os templates padrão com `ConfirmationURL` também são suportados pelo callback PKCE, mas o link precisa ser aberto no navegador que iniciou o fluxo. Os templates acima usam validação de token no servidor e o domínio de produção definido no Site URL.

O serviço padrão de e-mail do Supabase possui restrições de envio. Configure um provedor SMTP próprio para enviar confirmação e recuperação a usuários reais fora da equipe do projeto. Não desative a confirmação de e-mail para contornar falhas de entrega.

## 3. Configurar a Vercel

Em **Settings → Environment Variables**, adicione para **Production** (e Preview, se utilizado):

```text
NEXT_PUBLIC_SUPABASE_URL=https://znkteksinhmfsaozaznj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave pública do projeto>
```

Use a chave `sb_publishable_...` fornecida pelo Supabase. Nenhuma chave administrativa ou `service_role` é necessária para o aplicativo. A chave pública é usada junto da sessão autenticada, e o banco aplica as políticas RLS.

A configuração local fica em `.env.local`, que é ignorado pelo Git. Não publique credenciais administrativas.

Configure **Root Directory** como `controle-financeiro`. O `vercel.json` define Next.js, o comando `npm run build:vercel` e a saída `.next`. Após adicionar as variáveis, faça um novo deploy do commit atual.

## 4. Verificar o acesso

1. Sem login, abrir `/` deve direcionar para `/login`; `/api/state` deve responder HTTP 401.
2. Cadastre uma conta, confirme o e-mail e entre. O painel inicial deve estar vazio.
3. Crie um lançamento, recarregue e confirme que foi salvo.
4. Saia e entre em uma segunda conta. O lançamento da primeira não deve aparecer.
5. A recuperação de senha deve abrir `/nova-senha` após validar o link recebido.

Os testes locais verificam as regras SQL com dois usuários em PostgreSQL, acessos sem sessão ou com sessão inválida, isolamento, gravações concorrentes e validação de valores. Não substituem a verificação das configurações remotas de autenticação, e-mail e banco.

```powershell
node scripts/check-supabase-storage.mjs
npm run build:vercel
node --env-file=.env.local scripts/check-supabase-connection.mjs
```

## Dados existentes

Contas novas usam `emptyFinance()` e nunca recebem os lançamentos de `lib/initial-data.json`. Os dados atuais do SQLite/D1 não foram importados automaticamente. Antes da migração, identifique a conta do proprietário original e faça backup. A transferência precisa vincular o estado àquele UUID, sem repassar dados a outros usuários.

## Diagnóstico

| Sintoma | Conferir |
| --- | --- |
| Login informa que o acesso está sendo configurado | Variáveis públicas na Vercel e novo deploy após configurá-las. |
| Banco ainda não preparado | Migração SQL e exposição de `public.financial_accounts` na Data API. |
| Login rejeita a conta | E-mail confirmado, senha e disponibilidade do Supabase Auth. |
| Confirmação/recuperação não chega | SMTP, destinatários permitidos e limites de envio. |
| Link retorna para localhost | Site URL e Redirect URLs. |
| Dados não carregam após login | Logs da função `/api/state`, tabela, privilégios e RLS. |

Referências: [Supabase Auth com Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [templates de e-mail](https://supabase.com/docs/guides/auth/auth-email-templates), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [variáveis da Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables).
