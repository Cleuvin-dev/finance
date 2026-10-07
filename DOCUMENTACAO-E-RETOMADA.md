# Controle financeiro — documentação e ponto de retomada

> Atualização de 7 de outubro de 2026: o caminho atual usa Next.js na Vercel e Supabase Auth/PostgreSQL, com login e estado por usuário. Consulte [`controle-financeiro/VERCEL.md`](controle-financeiro/VERCEL.md) para aplicar a migração SQL, configurar as variáveis e os redirecionamentos. As seções sobre D1 e ausência de login abaixo descrevem o estado histórico anterior. Os dados locais existentes não foram migrados automaticamente.

Atualizado em 6 de outubro de 2026. Este documento registra o trabalho realizado, o funcionamento atual e o que falta para publicar o aplicativo. Os valores mencionados são exemplos ou registros históricos; o banco local contém os dados atuais e pode mudar durante o uso.

## 1. Situação atual

O aplicativo funciona localmente, com página web e banco SQLite persistente. Foi criado a partir de `FINANÇAS.xlsx`, sem modificar a planilha original. A publicação online ainda não foi concluída.

O caminho escolhido para preparar a publicação é hospedar o aplicativo na **Vercel** e usar **Cloudflare D1** como banco online. O usuário confirmou que já tem contas nesses serviços e um projeto criado na Vercel. A integração com a Vercel ainda não foi implementada.

### Informações confirmadas pelo usuário

- O aplicativo terá outros usuários futuramente. Preparar login e isolamento dos dados por usuário antes de disponibilizar o sistema.
- A conta Cloudflare já existe, mas o banco D1 ainda não foi criado.
- A conta Vercel e o projeto já existem; o nome/link do projeto ainda não foi informado.
- O código ainda não foi vinculado ao GitHub. A existência de uma conta GitHub não foi confirmada.
- Não foram fornecidos Database ID, Account ID ou credenciais de integração.

Essas confirmações não representam publicação concluída nem conexão ativa com um banco remoto.

Pasta de trabalho: `C:\Users\supor\Videos\Finanças`.

Projeto: `controle-financeiro`.

Endereço local: <http://localhost:8765>.

## 2. Histórico do trabalho realizado

1. Análise da planilha FINANÇAS, com 22 abas, e importação dos dados para o aplicativo. Os registros de setembro a dezembro de 2026 foram tratados como previstos.
2. Construção do painel financeiro, controle mensal, cadastros, distribuição de renda, reserva, patrimônio, metas, gráficos e ajuda.
3. Inclusão e esclarecimento dos campos para recebimentos, gastos e investimentos. Os lançamentos recalculam os indicadores automaticamente.
4. Adição do modo claro/escuro, com preferência salva no navegador.
5. Correção do patrimônio para somar automaticamente os investimentos lançados ao saldo inicial.
6. Reinicialização da reserva a pedido do usuário, com backup anterior à alteração.
7. Reinicialização dos investimentos e do saldo inicial de patrimônio a pedido do usuário, também com backup. Esses resets já foram executados e não devem ser repetidos na retomada.
8. Inclusão do quadro **Acúmulo total**, por último na seção, somando reserva e patrimônio.
9. Inclusão de retiradas da reserva e resgates dos investimentos.
10. Inclusão de compras parceladas, com quantidade de parcelas e mês/ano da primeira cobrança, inclusive atravessando a virada do ano.
11. Ajuste da tabela de metas mensais para considerar tanto reserva quanto investimentos, descontando as retiradas.
12. Atualização automática do nome do método de distribuição no menu lateral após salvar novos percentuais. O usuário adotou 60/30/10.
13. Inclusão de remoção de bancos, cartões e categorias dos cadastros disponíveis, preservando os lançamentos históricos.
14. Ajuste do quadro da visão geral para mostrar reserva + investimentos.
15. Aplicação de verde nos recebimentos e vermelho nas despesas.
16. Memorização do último mês e ano selecionados no navegador.
17. Orientação sobre publicação online, acesso pelo celular, D1 e integração com Vercel.

Após os resets, o usuário registrou um investimento de R$ 98 em outubro, usado para conferir os cálculos. Esse é um registro histórico, não uma declaração do saldo atual.

## 3. Como usar

### Iniciar o sistema

Abra `controle-financeiro\Iniciar controle financeiro.bat` e mantenha a janela do servidor aberta durante o uso. O computador precisa ter Python instalado. Não abra o HTML diretamente.

### Recebimentos e despesas

Em **Controle mensal**, selecione o mês e ano e use **Novo lançamento**. Escolha o tipo de recebimento para informar a renda do período. Para gastos, selecione o tipo correspondente e informe valor, data, descrição e demais campos disponíveis.

O sistema permite criar, editar, excluir e marcar pagamentos. Despesas recorrentes vinculadas podem atualizar os meses seguintes; parcelas podem ser editadas individualmente.

### Investimentos e reserva

Use **Adicionar investimento** para novos aportes e **Depositar na reserva** para guardar dinheiro na reserva. O campo **Saldo inicial dos investimentos** representa apenas o patrimônio anterior aos aportes registrados; preencher novamente o mesmo aporte nesse campo duplicaria o saldo.

Use **Retirar da reserva** ou **Resgatar investimento** para retirar dinheiro. Informe um valor positivo. O sistema reduz o saldo correspondente e devolve esse valor ao caixa do mês. A retirada não é contabilizada como recebimento. Se usar esse dinheiro para pagar uma conta, registre a despesa separadamente.

As validações bloqueiam operações que deixem reserva ou investimentos com saldo total negativo. Rendimentos dos investimentos não são calculados automaticamente.

### Parcelamentos

Para uma nova despesa, informe o **valor de cada parcela**, a quantidade de parcelas e o mês/ano da primeira cobrança. O valor informado não é dividido pelo número de parcelas.

Exemplo: R$ 200 por parcela, 3 parcelas, início em novembro/2026 gera R$ 200 em novembro/2026, dezembro/2026 e janeiro/2027, totalizando R$ 600. As parcelas futuras começam pendentes. O dia de vencimento é ajustado para o último dia nos meses mais curtos. Use o seletor de ano para consultar os períodos seguintes.

### Cadastros e preferências

O botão × permite remover bancos, cartões e categorias da lista de opções, mediante confirmação. Os lançamentos antigos são preservados. É possível cadastrar novamente o item.

Salvar os percentuais da distribuição atualiza também o menu lateral. Modo de cor e último período selecionado são preferências específicas do navegador.

## 4. Regras de cálculo

Os valores monetários são armazenados em centavos inteiros.

| Indicador | Regra |
| --- | --- |
| Recebimentos | Soma dos lançamentos de receita do período |
| Despesas | Soma de despesas fixas, variáveis e cartões do período |
| A pagar | Despesas menos despesas pagas |
| Caixa | Recebimentos − despesas pagas − aportes + retiradas |
| Disponível após compromissos | Recebimentos − todas as despesas − aportes + retiradas |
| Reserva acumulada | Depósitos na reserva − retiradas da reserva |
| Patrimônio gerador de renda | Saldo inicial dos investimentos + investimentos lançados − resgates |
| Acúmulo total | Reserva acumulada + patrimônio gerador de renda |
| Aportes mensais líquidos | Depósitos na reserva + investimentos − retiradas da reserva − resgates no mês |
| Diferença da meta mensal | Meta do mês − aportes mensais líquidos |

A tabela **Aportes e metas mensais** considera os movimentos do ano selecionado. O saldo inicial de investimentos não conta como aporte mensal. Por exemplo, um aporte de R$ 98 reduz uma meta de R$ 1.000 para R$ 902 restantes, com progresso de 9,8%.

Os saldos de reserva e patrimônio consideram o histórico completo. O quadro **Reserva + investimentos** da visão geral mostra o acúmulo total e compara esse saldo com a meta anual. A reserva e os investimentos permanecem separados nos respectivos quadros.

## 5. Onde ficam os dados e como preservar

Os dados financeiros usados pela versão local ficam em:

`controle-financeiro\dados-financeiros.sqlite3`

As preferências ficam no armazenamento local do navegador:

- `financas-theme`: modo claro/escuro.
- `financas-selected-period`: último mês e ano selecionados.

O arquivo `lib/initial-data.json` é a base inicial de importação, não o banco com todos os lançamentos atuais. Não substituir o banco existente por esse arquivo ao continuar o desenvolvimento ou migrar para a nuvem.

Backups criados antes dos resets, dentro do projeto:

- `backup-antes-zerar-reserva-20261006-152503.sqlite3`.
- `backup-antes-zerar-patrimonio-20261006-152742.sqlite3`.

Para um backup completo, feche o servidor e copie o banco SQLite para outro local. O CSV exportado serve para consulta em planilhas, mas não substitui uma cópia completa do banco. Não há sincronização automática com alterações posteriores feitas no Excel.

O arquivo `Controle-Financeiro.zip`, na pasta principal, é um pacote da versão local. Ele não inclui o banco com os dados pessoais atuais.

## 6. Estrutura técnica

| Arquivo/pasta dentro de controle-financeiro | Responsabilidade |
| --- | --- |
| `app/finance-app.tsx` | Interface, formulários, gráficos e navegação |
| `app/globals.css` | Estilos, cores e adaptação de layout |
| `app/theme-toggle.tsx` | Alternância de tema |
| `lib/finance.ts` | Regras financeiras, parcelas, saldos e recorrências |
| `lib/initial-data.json` | Dados iniciais importados |
| `servidor.py` | Servidor local e persistência SQLite |
| `local-preview/` | Entrada da versão local |
| `local-dist/` | Página compilada servida localmente |
| `app/api/state/route.ts` | API preparada para D1: leitura e gravação do estado |
| `lib/storage.ts` | Acesso ao D1 por binding de Cloudflare Workers |
| `db/schema.ts` | Definição da tabela financeira |
| `drizzle/0000_financial_state.sql` | Migração inicial do banco |
| `.openai/hosting.json` | Identificação do projeto previamente registrado em Sites |
| `scripts/` | Compilação, verificações e scripts de alterações anteriores |

Tecnologias principais: React 19, TypeScript, Vite para a versão local, Python/SQLite no servidor local. A preparação para Cloudflare usa Vinext/Workers e Drizzle para o esquema/migração.

A persistência armazena o estado financeiro em JSON na tabela `financial_state`, com versão e data de atualização. A API usa controle de versão para rejeitar uma gravação quando os dados foram alterados por outra janela, retornando conflito HTTP 409. Também valida entradas, percentuais, identificadores e saldos.

**A estrutura atual usa um único estado identificado por `main`. Não existe ainda login próprio nem separação de dados por usuário.** A checagem de origem existente na API não substitui autenticação.

## 7. Verificações realizadas e limites

Foram realizadas compilações da versão local, verificação TypeScript, testes das regras financeiras e verificações da API/persistência. Os scripts incluem:

- `check-finance.mjs`: cálculos básicos e recorrências.
- `check-storage.mjs`: armazenamento, validação e conflitos.
- `check-investment-progress.mjs`: patrimônio e investimentos.
- `check-withdrawals.mjs` e `check-withdrawals-server.py`: retiradas e validação.
- `check-installments.mjs`: parcelas, meses curtos e virada de ano.
- `check-monthly-goals.mjs`: metas com reserva e investimentos.

Essas verificações registram o que foi validado durante as alterações; não significam que todos os testes foram executados novamente na data de leitura deste documento. Os scripts que aplicaram alterações anteriores não devem ser reexecutados indiscriminadamente.

Comandos de desenvolvimento, executados dentro do projeto:

```powershell
npm run build -- --local
node node_modules/typescript/bin/tsc --noEmit
python servidor.py --no-browser
```

O layout já possui regras para telas menores e modo escuro. A validação visual automatizada em navegador não ficou disponível neste ambiente. Ainda é necessário verificar o uso real no celular, incluindo formulários, tabelas, teclado e navegação.

## 8. Publicação: o que foi e não foi feito

Um projeto privado foi registrado anteriormente em Sites, mas a publicação falhou por falta de acesso ao repositório remoto no ambiente. Não há endereço online confirmado em funcionamento. O D1 de produção também não está confirmado como ativo com os dados atuais.

Se esse caminho anterior for retomado, reutilizar o identificador existente em `.openai/hosting.json` em vez de registrar outro projeto. A opção mais recente discutida com o usuário, porém, é **Vercel + Cloudflare D1**.

Essa combinação permite:

**Celular/computador → aplicativo na Vercel → API protegida → Cloudflare D1.**

O código atual importa `cloudflare:workers` e acessa `env.DB`. Esse binding é próprio do ambiente Cloudflare e precisa ser adaptado para funcionar na Vercel. Os caminhos possíveis são consultar o D1 pela API HTTP no servidor da Vercel ou manter uma API em Cloudflare Worker ligada ao D1. A decisão final e a implementação ainda estão pendentes.

Fontes oficiais consultadas:

- [API HTTP do D1](https://developers.cloudflare.com/api/resources/d1/subresources/database/methods/query/).
- [Binding D1 em Workers](https://developers.cloudflare.com/d1/worker-api/).
- [Funções da Vercel](https://vercel.com/docs/functions).
- [Variáveis de ambiente da Vercel](https://vercel.com/docs/environment-variables).
- [Preços e limites do D1](https://developers.cloudflare.com/d1/platform/pricing/).

Na consulta realizada, o plano gratuito do D1 incluía 5 milhões de linhas lidas por dia, 100 mil linhas escritas por dia e 5 GB de armazenamento total. Conferir novamente os limites ao publicar. Esses limites não representam custos ou franquias da Vercel, domínio ou outros serviços.

## 9. Próximos passos, em ordem

1. Obter o nome/link do projeto já criado na Vercel. As contas Vercel e Cloudflare já foram confirmadas; o requisito de vários usuários também está confirmado.
2. Fazer backup do banco local atual antes de qualquer migração. Preservar os lançamentos que o usuário continuar cadastrando.
3. Definir a arquitetura da API e adaptar a compilação do aplicativo para a Vercel.
4. Criar/configurar o D1, ainda inexistente, obter Account ID e Database ID e aplicar a migração do esquema. Nome sugerido: `controle-financeiro`.
5. Implementar autenticação e substituir o estado compartilhado `main` por armazenamento vinculado ao usuário, validando autorização em cada leitura/gravação. A necessidade de vários usuários já foi confirmada, mas o método de login ainda não foi escolhido.
6. Configurar credenciais apenas no servidor: identificadores da conta/banco e token restrito às permissões necessárias, se usada a API HTTP. Não incluir token no frontend, neste documento ou no repositório.
7. Implementar e verificar a leitura/gravação remota, incluindo conflitos, mensagens de erro e preservação dos dados quando uma gravação falhar.
8. Migrar os dados reais do SQLite local, conferindo contagem de registros, saldos, metas, cadastros e percentuais. Não importar apenas o seed inicial.
9. Criar/vincular um repositório privado no GitHub ao projeto existente da Vercel, mantendo bancos locais, backups e credenciais fora do repositório. Publicar e validar acesso HTTPS, login, isolamento entre usuários e sincronização entre computador e celular.
10. Validar layout móvel, parcelamentos entre anos, retiradas, modo escuro e atualização das metas. Definir rotina de backup e recuperação online.

## 10. Ponto exato de retomada

**Paramos após o usuário confirmar que já tem contas Cloudflare e Vercel, com projeto criado na Vercel. O D1 ainda não foi criado e nada foi vinculado ao GitHub. O sistema terá outros usuários futuramente, portanto login e isolamento dos dados são requisitos confirmados. Nenhuma integração com a Vercel foi aplicada até este ponto.**

Informações pendentes para a próxima etapa: nome/link do projeto Vercel; criação do banco D1 e seus Account ID/Database ID; disponibilidade da conta/repositório GitHub; escolha do método de login. Não solicitar senhas ou tokens na conversa: configurar os segredos diretamente no ambiente do servidor.

Ao retomar, ler este documento e inspecionar os arquivos atuais. Continuar a partir dos dados existentes, sem repetir os resets, sem apagar lançamentos e sem assumir que um endereço online já está ativo. Preparar a integração, autenticação e migração antes de publicar o acesso aos dados financeiros.

Mensagem sugerida para retomar:

> Continue o projeto em C:\Users\supor\Videos\Finanças. Leia DOCUMENTACAO-E-RETOMADA.md. Já tenho contas Cloudflare e Vercel e um projeto na Vercel. O sistema terá vários usuários. Confira as pendências documentadas e prepare login, isolamento dos dados e integração com D1, preservando meu banco local atual.
