# Aplicativo de controle financeiro

Aplicativo de finanças pessoais com controle mensal, receitas, despesas, parcelas, reserva, investimentos, metas, cadastros, exportação CSV e temas claro/escuro.

**Produção:** <https://finance-mada.vercel.app>.

O site usa Next.js na Vercel e Supabase para login e dados individuais. A versão local anterior usa Python/SQLite e continua independente. Em 7 de outubro de 2026, o usuário confirmou login e gravação normal na versão online.

## Documentação

- [Documentação completa e retomada](../DOCUMENTACAO-E-RETOMADA.md): histórico, arquitetura, testes e próximos passos.
- [README técnico da planilha](../README.md): abas, fórmulas e importação.
- [Configuração Vercel e Supabase](VERCEL.md): banco, políticas RLS, variáveis, URLs e e-mails.
- [Guia da versão local](COMO-USAR.md): uso do servidor Python e banco local.

## Desenvolvimento da versão online

Use Node.js compatível com `package.json` e instale as dependências:

```powershell
npm ci
```

Configure em `.env.local` a URL e a chave pública do projeto Supabase:

```text
NEXT_PUBLIC_SUPABASE_URL=https://znkteksinhmfsaozaznj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave pública do projeto>
```

Para executar Next.js em desenvolvimento:

```powershell
node node_modules/next/dist/bin/next dev --webpack
```

Para compilar e executar a versão de produção local:

```powershell
npm run build:vercel
node node_modules/next/dist/bin/next start
```

O código anterior de Vinext permanece no projeto. `npm run dev`, `npm run build` e `npm start` ainda apontam para esse caminho; para reproduzir a versão Vercel, use os comandos Next.js acima.

## Banco e autenticação

O SQL em `supabase/migrations/202610070001_financial_accounts.sql` define a tabela `financial_accounts`, as permissões, as políticas RLS e a trigger de versão. O servidor valida a sessão e usa o UUID autenticado para determinar a conta. Novos usuários recebem um estado financeiro vazio, sem dados da planilha original.

O cadastro e a recuperação de senha dependem das URLs de retorno e da configuração de e-mail descritas em `VERCEL.md`. Não copiar chaves administrativas para o frontend.

## Verificações

```powershell
node scripts/check-storage.mjs
node scripts/check-finance.mjs
node scripts/check-withdrawals.mjs
node scripts/check-installments.mjs
```

`check-storage.mjs` executa os testes Supabase/PostgreSQL com RLS em banco local de teste. `check-auth-ui.mjs` verifica telas de autenticação contra um servidor Next.js local na porta 3017, usando Playwright e Chrome instalado. Esses testes não criam contas reais nem enviam e-mails.

## Dados existentes

`dados-financeiros.sqlite3` pertence à versão local. `lib/initial-data.json` é o snapshot original de importação. Nenhum deles é sincronizado automaticamente com Supabase. A migração dos dados antigos para a conta do proprietário está pendente e deve preservar os lançamentos online já salvos.

Não reexecutar scripts históricos de reset ou de alteração do código sem revisar sua finalidade. A pasta `build/` contém fontes necessárias e deve continuar versionada.
