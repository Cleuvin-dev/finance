# Deploy na Vercel

Configure o projeto com Root Directory `controle-financeiro` e Framework Preset `Next.js`. O arquivo `vercel.json` define o comando `npm run build:vercel` e a saída `.next`. Esse comando executa Next.js e gera `routes-manifest.json`. O comando `npm run build` continua disponível para o caminho anterior de Vinext/Cloudflare.

## Banco D1

A API Next.js acessa o D1 por HTTP. Configure estas variáveis no servidor da Vercel, sem o prefixo `NEXT_PUBLIC_`:

- `CLOUDFLARE_ACCOUNT_ID`: identificador da conta Cloudflare.
- `CLOUDFLARE_D1_DATABASE_ID`: identificador do banco D1.
- `CLOUDFLARE_API_TOKEN`: token com permissão de leitura e escrita no D1 da conta.

Crie a tabela executando a migração `drizzle/0000_financial_state.sql` no banco antes de usar o aplicativo. Sem as variáveis ou a tabela, a compilação pode concluir, mas `/api/state` retorna HTTP 503.

O primeiro acesso a um banco vazio usa `lib/initial-data.json` como estado inicial. Esse arquivo não substitui o banco SQLite local atual. A migração dos lançamentos atuais precisa ser realizada separadamente.

O aplicativo ainda usa um único estado `main` e não possui autenticação própria ou isolamento por usuário. Restrinja o acesso ao projeto enquanto essas funcionalidades não estiverem implementadas.

A API HTTP do D1 está sujeita aos limites da API Cloudflare. Consulte a [documentação do D1](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/).
