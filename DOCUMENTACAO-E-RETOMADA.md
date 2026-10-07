# Controle financeiro — documentação e ponto de retomada

Atualizado em **7 de outubro de 2026**, após o usuário confirmar acesso ao site e gravação normal dos lançamentos. Este documento consolida o trabalho anterior na versão local e a publicação com login e banco individual. Os registros e valores citados como exemplos não representam saldos atuais.

## 1. Estado atual confirmado

O aplicativo está publicado na Vercel e utiliza Supabase Auth para login e PostgreSQL para os dados de cada conta. O usuário confirmou que conseguiu entrar e salvar lançamentos normalmente. A versão Python/SQLite local permanece independente e seus dados não foram migrados automaticamente para a conta online.

| Item | Estado / endereço |
| --- | --- |
| Site em produção | <https://finance-mada.vercel.app> |
| Login | <https://finance-mada.vercel.app/login> |
| Cadastro | <https://finance-mada.vercel.app/cadastro> |
| Recuperação de senha | <https://finance-mada.vercel.app/recuperar-senha> |
| Repositório GitHub | <https://github.com/Cleuvin-dev/finance> |
| Branch de publicação | `main` |
| Projeto Supabase | `znkteksinhmfsaozaznj` |
| API Supabase | `https://znkteksinhmfsaozaznj.supabase.co` |
| Painel Supabase | <https://supabase.com/dashboard/project/znkteksinhmfsaozaznj> |
| Pasta de trabalho atual | `C:\Users\supor\Documents\Finanças` |
| Pasta do aplicativo | `controle-financeiro` |
| Servidor Python local | `http://localhost:8765` |

O caminho `C:\Users\supor\Videos\Finanças`, mencionado na documentação anterior, não é o diretório de trabalho atual desta sessão. Inspecionar o diretório correto antes de qualquer alteração.

**Não repetir os resets anteriores, não substituir o banco local pelo seed e não importar dados históricos para todas as contas.**

## 2. Histórico funcional da versão local

1. Análise da planilha `FINANÇAS.xlsx`, com 22 abas, e importação para o aplicativo. A importação original classificou janeiro a agosto de 2026 como realizados e setembro a dezembro como previstos.
2. Criação do painel, controle mensal, cadastros, distribuição de renda, reserva, patrimônio, metas, gráficos e ajuda.
3. Inclusão de lançamentos de recebimentos, despesas e investimentos, com recálculo dos indicadores.
4. Adição do modo claro/escuro, com preferência salva no navegador.
5. Correção do patrimônio para somar investimentos lançados ao saldo inicial.
6. Reinicialização da reserva a pedido do usuário, com backup anterior à alteração.
7. Reinicialização dos investimentos e do saldo inicial de patrimônio, também a pedido do usuário e com backup. Essas operações já foram realizadas.
8. Inclusão do quadro **Acúmulo total**, somando reserva e patrimônio.
9. Inclusão de retiradas da reserva e resgates dos investimentos.
10. Inclusão de compras parceladas com valor por parcela, quantidade, primeira cobrança e passagem entre anos.
11. Ajuste das metas mensais para considerar reserva e investimentos, descontando retiradas e resgates.
12. Atualização do nome do método de distribuição no menu após salvar percentuais. Na versão local o usuário adotou 60/30/10; isso não implica que toda conta online use esse percentual.
13. Remoção de bancos, cartões e categorias dos cadastros disponíveis, preservando lançamentos antigos.
14. Ajuste da visão geral para mostrar reserva + investimentos.
15. Aplicação de verde nos recebimentos e vermelho nas despesas.
16. Memorização do último mês e ano selecionados.

Após os resets, um investimento de R$ 98 em outubro foi usado para conferir cálculos. Esse lançamento é uma referência histórica, não uma declaração do saldo atual.

## 3. GitHub e documentação técnica da planilha

A pasta principal já tinha um Git vazio com o remoto informado pelo usuário. A pasta do aplicativo também continha um Git vazio. O Git interno foi preservado como `controle-financeiro/.git-local-backup`, ignorado pelo repositório principal, para que os arquivos fossem publicados como código normal, sem um submódulo vazio.

Foi criado um `.gitignore` na raiz para excluir dependências, caches, artefatos gerados, ferramentas locais, bancos SQLite, backups, planilha original e pacotes ZIP duplicados. Os arquivos locais não foram apagados. A chave pública de configuração local está em `.env.local`, que não foi enviada ao GitHub.

O [`README.md`](README.md) da raiz descreve tecnicamente as **22 abas, 3.614 fórmulas e quatro gráficos** da planilha, incluindo indicadores mensais, consolidação anual, distribuição 50/30/20, reserva e importação. Também registra limitações encontradas nas referências e nos intervalos da planilha. As fórmulas foram lidas, mas a planilha não foi corrigida ou recalculada no Excel durante essa documentação.

### Commits principais desta etapa

| Commit | Alteração |
| --- | --- |
| `6f1251e` | Primeiro envio: código, documentação e scripts. |
| `1c2594c` | README técnico da planilha. |
| `3e13d81` | Inclusão dos plugins e fontes de worker necessários na pasta `build`. |
| `0b40327` | Build Next.js para Vercel e adaptação temporária de acesso D1 por HTTP. |
| `36c0264` | Supabase, login, cadastro, recuperação, contas individuais e SQL com RLS. |

`controle-financeiro/build` contém código-fonte necessário. Não voltar a ignorar essa pasta como se fosse apenas saída de compilação.

## 4. Erros de deploy e correções

| Problema observado | Causa / tratamento |
| --- | --- |
| `Module not found` para `./build/connector-preview-plugin.mjs` em `vite.config.ts` | A pasta `build` havia sido excluída pelo `.gitignore` no envio inicial. A exclusão foi removida e os cinco arquivos necessários foram publicados. |
| Ausência de `.next/routes-manifest.json` | A Vercel esperava Next.js, mas o comando compilava com Vinext. Foi criado `build:vercel`, que executa `next build --webpack`, e um `vercel.json` com framework Next.js e saída `.next`. |
| Site publicado, mas exibindo erro ao carregar dados | A compilação não garantia a disponibilidade do banco. A versão intermediária dependia de D1, configuração e tabela remota. Posteriormente a integração ativa foi substituída por Supabase. |
| Aviso para remover prefixo público na variável | As duas variáveis do cliente Supabase devem manter `NEXT_PUBLIC_` e usar o tipo **Config** na Vercel. A URL e a chave publishable são configurações públicas; chaves administrativas não são utilizadas no cliente. |
| Falha de execução local `spawn EPERM` | O sandbox bloqueava processos de compilação/testes. As verificações necessárias foram executadas com autorização fora do sandbox. Esse erro local não foi atribuído à Vercel. |

O usuário realizou o redeploy após configurar as variáveis. Nas consultas ao site, a API inicialmente retornou HTTP 503 e depois HTTP 401 para uma requisição sem sessão. O motivo exato do primeiro 503 não foi confirmado pelos logs do provedor; o retorno posterior e o uso confirmado pelo usuário demonstraram funcionamento da versão atual.

## 5. Arquitetura online e escolha do Supabase

A opção inicial era Vercel + Cloudflare D1. Foi implementado temporariamente um adaptador HTTP para D1, porque `cloudflare:workers` não funciona como binding no servidor Node.js da Vercel.

Com o requisito de login e contas individuais, foi escolhida a arquitetura atual:

```text
Navegador → Next.js na Vercel → Supabase Auth / PostgreSQL
                                 sessão verificada + políticas RLS
```

O Supabase reúne autenticação e regras de autorização no PostgreSQL. O adaptador D1 anterior foi preservado em `lib/storage-d1.ts`, mas a API atual não o utiliza. As contas Cloudflare e a estrutura antiga de Vinext/Workers não são necessárias para carregar ou salvar os dados da versão online atual.

### Autenticação

- `/login`: entrada com e-mail e senha.
- `/cadastro`: criação de conta com nome, e-mail e senha.
- `/recuperar-senha`: solicitação de link por e-mail.
- `/nova-senha`: atualização da senha após validação da sessão.
- `/auth/callback`: troca do código PKCE ou validação de token de confirmação/recuperação.
- Botão **Sair**: encerra a sessão no navegador e retorna ao login.

O servidor verifica o usuário com `auth.getUser()` antes de renderizar o painel ou ler/gravar dados. `proxy.ts` verifica/atualiza a sessão com `getClaims()`. As respostas com autenticação não devem ser armazenadas em cache compartilhado.

Os retornos do callback são limitados ao painel e à tela de nova senha, evitando redirecionamento para um domínio arbitrário. A troca de conta em uma aba provoca recarregamento, e a API bloqueia a tentativa de salvar o estado de uma aba pertencente a outra conta.

### Banco e atributos

As contas e senhas são administradas pelo Supabase Auth. O nome do cadastro fica nos metadados de apresentação e não decide autorização.

| Coluna de `public.financial_accounts` | Tipo / responsabilidade |
| --- | --- |
| `user_id` | UUID, chave primária e referência a `auth.users.id`. |
| `payload` | JSONB com lançamentos, cadastros, metas e parâmetros financeiros. |
| `version` | Inteiro iniciado em 1 para controle de concorrência. |
| `created_at` | Timestamp com fuso da criação da conta financeira. |
| `updated_at` | Timestamp com fuso da última gravação. |

Uma trigger incrementa a versão e atualiza a data ao gravar. A API exige a versão atual; uma versão desatualizada retorna HTTP 409 e não sobrescreve o estado mais novo.

O SQL de instalação está em [`supabase/migrations/202610070001_financial_accounts.sql`](controle-financeiro/supabase/migrations/202610070001_financial_accounts.sql). Ele habilita RLS e limita leitura, criação e alteração à linha cujo `user_id` corresponde a `auth.uid()`. Anônimos não possuem acesso à tabela. Usuários comuns podem alterar apenas o payload, sem trocar o proprietário, modificar a versão diretamente ou excluir a conta pela Data API.

Novas contas são inicializadas com `emptyFinance()`: sem lançamentos, bancos, cartões, saldos ou dados pessoais da planilha. O método inicial é 50/30/20 e pode ser alterado pelo usuário.

## 6. Configurações e credenciais

Na Vercel, o **Root Directory** é `controle-financeiro`. O arquivo `vercel.json` define o framework Next.js, o comando `npm run build:vercel` e o diretório `.next`.

Variáveis configuradas para o aplicativo:

```text
NEXT_PUBLIC_SUPABASE_URL=https://znkteksinhmfsaozaznj.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<chave publishable do projeto>
```

As duas usam o tipo **Config**, mantendo o prefixo público. Após alterar variáveis, realizar novo deploy. O valor completo da chave não é reproduzido nesta documentação. Não usar `service_role`, `sb_secret_...`, senha pessoal ou token administrativo nessas variáveis.

O usuário informou o domínio de produção, configurou as variáveis e realizou o redeploy. A chave fornecida foi usada em consultas de leitura ao Supabase e na configuração local ignorada pelo Git; ela não permite executar migrações ou administrar o projeto.

As instruções completas de URL de retorno, templates de confirmação/recuperação e SMTP estão em [`controle-financeiro/VERCEL.md`](controle-financeiro/VERCEL.md). Não afirmar que os templates ou o SMTP foram inspecionados no painel: não houve acesso administrativo do agente. O acesso e a gravação foram confirmados, mas o fluxo real de recuperação ainda precisa ser validado.

## 7. Como usar

### Versão online

Abra o site, entre na conta e registre os movimentos no seu painel. O controle financeiro é iniciado individualmente. Use o botão **Sair** em computadores compartilhados. Não é necessário manter o servidor Python aberto para usar a versão online.

### Versão local existente

Abra `controle-financeiro\Iniciar controle financeiro.bat` e mantenha o servidor aberto. O computador precisa ter Python. Não abrir o HTML diretamente. Essa versão consulta o SQLite local e não sincroniza automaticamente com Supabase.

### Lançamentos, reserva e investimentos

Em **Controle mensal**, selecione mês/ano e use **Novo lançamento**. É possível criar, editar, excluir e marcar despesas como pagas. Movimentos recorrentes vinculados podem atualizar os meses seguintes.

Use **Adicionar investimento**, **Depositar na reserva**, **Retirar da reserva** e **Resgatar investimento** para os respectivos movimentos. O saldo inicial dos investimentos representa patrimônio anterior aos aportes registrados; informar novamente o mesmo aporte nesse campo duplica o saldo. Retiradas devolvem dinheiro ao caixa, sem contar como recebimento. Registre separadamente a despesa paga com esse dinheiro.

### Parcelamentos

Informe o **valor de cada parcela**, a quantidade e o mês/ano da primeira cobrança. O valor não é dividido pela quantidade. Por exemplo, três parcelas de R$ 200 a partir de novembro/2026 geram R$ 200 em novembro, dezembro e janeiro/2027. Parcelas futuras começam pendentes e os vencimentos são ajustados para o último dia dos meses curtos.

### Cadastros e preferências

O botão × remove bancos, cartões ou categorias das opções sem apagar lançamentos antigos. Os percentuais de distribuição atualizam o menu lateral. A preferência de tema fica em `financas-theme`; o período online fica em `financas-selected-period:<UUID do usuário>`. A versão local mantém a chave `financas-selected-period`.

## 8. Regras financeiras

Valores monetários são armazenados em centavos inteiros. Rendimentos de investimentos não são calculados automaticamente.

| Indicador | Regra |
| --- | --- |
| Recebimentos | Soma das receitas do período. |
| Despesas | Despesas fixas + variáveis + faturas. |
| A pagar | Despesas − despesas pagas. |
| Caixa | Recebimentos − despesas pagas − aportes + retiradas. |
| Disponível após compromissos | Recebimentos − todas as despesas − aportes + retiradas. |
| Reserva acumulada | Depósitos na reserva − retiradas. |
| Patrimônio gerador de renda | Saldo inicial + investimentos − resgates. |
| Acúmulo total | Reserva + patrimônio gerador de renda. |
| Aportes mensais líquidos | Depósitos na reserva + investimentos − retiradas − resgates no mês. |
| Diferença da meta mensal | Meta − aportes mensais líquidos. |

Metas mensais consideram os movimentos do ano selecionado. O saldo inicial não conta como aporte mensal. Reserva e patrimônio acumulados consideram o histórico completo. Operações que deixem esses saldos negativos são rejeitadas pela validação da API.

## 9. Dados, backups e migração pendente

| Origem | Conteúdo / situação |
| --- | --- |
| `FINANÇAS.xlsx` | Planilha original preservada e ignorada no Git. |
| `lib/initial-data.json` | Snapshot da importação original, versionado no código. Não representa necessariamente os lançamentos locais atuais e não é copiado para novas contas online. |
| `dados-financeiros.sqlite3` | Banco atual da versão local, ignorado no Git. |
| Supabase `financial_accounts` | Lançamentos da versão online, vinculados à conta autenticada. |
| `Controle-Financeiro.zip` | Pacote local anterior, ignorado no Git. Não substituir a versão online por esse pacote. |

Backups existentes dos resets, dentro do projeto:

- `backup-antes-zerar-reserva-20261006-152503.sqlite3`.
- `backup-antes-zerar-patrimonio-20261006-152742.sqlite3`.

Para copiar o banco local com segurança, encerrar o servidor antes do backup. O CSV serve para consulta e não substitui uma cópia completa do banco.

**Os dados antigos não foram migrados para o Supabase.** Antes dessa etapa, identificar o UUID da conta proprietária, preservar tanto o SQLite quanto os lançamentos online já criados e decidir como tratar registros duplicados. Não sobrescrever o payload online com o seed ou com um banco antigo. Conciliar quantidade de registros, saldos, metas e cadastros depois da transferência.

## 10. Estrutura técnica atual

| Arquivo/pasta dentro do aplicativo | Responsabilidade |
| --- | --- |
| `app/page.tsx` | Verificação da sessão e abertura do painel. |
| `app/finance-app.tsx` | Interface financeira, lançamentos, gráficos e preferências. |
| `app/auth-form.tsx` | Formulários de login, cadastro e senha. |
| `app/login`, `app/cadastro`, `app/recuperar-senha`, `app/nova-senha` | Rotas das telas de autenticação. |
| `app/auth/callback/route.ts` | Validação dos links e retorno para o aplicativo. |
| `app/account-menu.tsx` | Conta atual e saída da sessão. |
| `app/api/state/route.ts` | Leitura/gravação autenticada, validação, origem e limite de tamanho. |
| `proxy.ts` | Renovação da sessão e cabeçalhos sem cache. |
| `lib/supabase/` | Clientes Supabase de navegador e servidor e leitura da configuração. |
| `lib/storage.ts` | Persistência por usuário no Supabase. |
| `lib/storage-d1.ts` | Adaptador anterior de D1, fora da API ativa. |
| `lib/empty-finance.ts` | Inicialização vazia de uma nova conta. |
| `lib/finance-schema.ts` | Validação dos valores e invariantes financeiros. |
| `lib/finance.ts` | Cálculos, parcelas, status e recorrências. |
| `supabase/migrations/` | Tabela, privilégios, políticas RLS e trigger de versão. |
| `vercel.json` | Configuração de compilação e saída para Vercel. |
| `servidor.py`, `local-preview/`, `local-dist/` | Caminho local Python/SQLite e frontend compilado. |
| `db/`, `drizzle/`, `build/`, `vite.config.ts` | Estrutura local/anterior de Cloudflare; `build/` contém fontes necessárias. |

Versões no projeto nesta etapa: React 19.2.6, Next.js 16.3.4, TypeScript 5.9.3, `@supabase/supabase-js` 2.117.3 e `@supabase/ssr` 0.12.7. O lockfile registra as dependências instaladas.

## 11. Verificações realizadas

### Testes locais executados nesta sessão

- `npm run build:vercel`: compilação Next.js e verificação TypeScript concluídas, com `routes-manifest.json` gerado.
- `check-supabase-storage.mjs` / `check-storage.mjs`: SQL executado em PostgreSQL local via PGlite, RLS com dois usuários, negação a anônimos e sessões inválidas, estado inicial vazio, validação de valores, gravações concorrentes e reaplicação da migração sem perda dos dados de teste.
- `check-auth-ui.mjs`: Chrome sem janela, layouts de 1440 px e 390 px, tema escuro, login inválido, confirmação de senha, recuperação e retornos. Respostas de escrita no Supabase foram simuladas; nenhuma conta real foi criada e nenhum e-mail foi enviado por esses testes.
- `check-finance.mjs`, `check-withdrawals.mjs` e `check-installments.mjs`: cálculos, retiradas, saldos, parcelas, datas e passagem entre anos.
- Revisão visual das capturas de desktop e celular, com correção da quebra do título no celular.

As capturas ficam em `controle-financeiro/outputs/auth-check`, ignoradas pelo Git. Os servidores de teste desta sessão foram encerrados.

### Consultas remotas e confirmações do usuário

1. Supabase Auth respondeu HTTP 200 às consultas públicas de configuração, com e-mail habilitado e cadastro permitido.
2. A primeira consulta à tabela retornou `PGRST205`, indicando tabela ausente/não disponível na Data API naquele momento.
3. Após a configuração pelo usuário, a consulta anônima retornou `42501`, indicando bloqueio de acesso à tabela. Isso não equivale a uma inspeção administrativa de todas as políticas.
4. A raiz do site retornou HTTP 307 para `/login`.
5. A tela de login foi servida sem a mensagem de configuração pendente.
6. A API sem sessão retornou HTTP 401 e `Cache-Control: private, no-store` após o redeploy.
7. O usuário confirmou acesso correto e, em seguida, que os lançamentos salvaram normalmente.

O isolamento foi validado em PostgreSQL local de teste. Ainda não houve uma verificação manual com duas contas reais em produção. O agente não inspecionou senhas, dados financeiros reais das contas ou configurações administrativas do Supabase.

## 12. Pendências e prioridades

1. Validar duas contas reais em produção: lançar em uma, sair, entrar na outra e confirmar que não há leitura ou alteração cruzada.
2. Validar confirmação de cadastro, recuperação de senha e saída em produção. Conferir redirecionamentos, templates e SMTP quando necessário.
3. Se solicitado, migrar os dados locais existentes apenas para a conta proprietária, preservando os lançamentos online já salvos e resolvendo duplicidades.
4. Definir rotina de backup e recuperação do banco online e verificar as condições do plano contratado antes de depender dela.
5. Verificar o painel autenticado no celular, incluindo formulários, tabelas, exportação, parcelas entre anos, retiradas e temas. As telas de autenticação já foram verificadas visualmente em tamanhos de desktop e celular.

Não recriar a integração de D1 ou substituir a arquitetura atual sem uma nova decisão do usuário. O site, o login e a gravação da conta utilizada já estão funcionando.

## 13. Ponto exato de retomada

**Encerramos após o usuário confirmar que entrou corretamente no site e que os lançamentos salvaram normalmente. O código está no GitHub e a produção usa Vercel + Supabase. A documentação registra o SQL, a configuração, os testes e as pendências.**

Ao retomar:

- Ler este documento, o README e `controle-financeiro/VERCEL.md`.
- Conferir `git status`, o código atual e o estado do site antes de modificar.
- Preservar tanto o banco local quanto os dados online. Não repetir resets.
- Não pedir novamente o domínio, a referência do projeto Supabase ou o repositório: estão registrados acima.
- Se houver falha online, consultar os logs atuais de `/api/state` ou de autenticação. Não confundir logs de deploy antigos com o estado atual.

Mensagem sugerida para a próxima sessão:

> Continue o projeto em C:\Users\supor\Documents\Finanças. Leia DOCUMENTACAO-E-RETOMADA.md e controle-financeiro/VERCEL.md. O site finance-mada.vercel.app usa Supabase, e login e gravação já foram confirmados. Preserve os dados locais e online, não repita resets e continue pelas pendências documentadas.
