# Controle financeiro pessoal

Este repositório contém um aplicativo de controle financeiro desenvolvido a partir da planilha **FINANÇAS.xlsx** e os scripts utilizados para analisar e importar seus dados. A planilha organiza receitas, despesas, pagamentos, investimentos e reserva de emergência ao longo de um ano, consolidando os lançamentos em indicadores e gráficos.

Esta documentação descreve tecnicamente a planilha original e sua relação com o aplicativo. A versão analisada contém **22 abas, 3.614 células com fórmulas e quatro gráficos**. O arquivo Excel original não é versionado, conforme as regras do `.gitignore`.

## Estrutura da planilha

| Aba | Responsabilidade |
| --- | --- |
| `Janeiro` a `Dezembro` | Entrada de lançamentos e cálculo dos indicadores mensais. |
| `Base` | Consolidação dos seis indicadores de cada mês em uma tabela anual. |
| `DM` | Agregações por mês e totais utilizados pelo dashboard. |
| `Tabela dinâmica 2` | Resumo por mês de gastos e recebimentos, com gráfico. |
| `DASHBOARD` | Indicadores anuais e três gráficos de acompanhamento financeiro. |
| `Categorias` | Cadastro de categorias para classificar despesas. |
| `Bancos` | Cadastro de instituições usadas nos pagamentos. |
| `Cartão` | Cadastro de cartões para controle de faturas. |
| `RESERVA DE EMERGÊNCIA 2026` | Metas e depósitos mensais da reserva, total acumulado e percentual de cumprimento. |
| `Rendimento` | Referência educativa sobre reserva, patrimônio e etapas de independência financeira. |
| `Ajuda` | Orientações de preenchimento e descrição das funções da planilha. |

## Controle mensal

Cada aba mensal reúne cinco grupos de informações:

1. **Despesas fixas:** descrição, categoria, vencimento, situação calculada, valor, status de pagamento e instituição utilizada.
2. **Despesas variáveis:** os mesmos campos, em um bloco separado.
3. **Faturas de cartões:** cartão, status e valor da fatura.
4. **Recebimentos:** descrição, data e valor recebido.
5. **Investimentos:** descrição, data e valor aportado.

Os blocos fixos e variáveis ocupam as linhas 13 a 52. O bloco de cartões e recebimentos ocupa as linhas 63 a 69. Os investimentos são registrados nas linhas 15 a 43, nas colunas V a X. Existem validações de dados nas abas mensais para apoiar o preenchimento.

### Indicadores e fórmulas

As fórmulas abaixo foram conferidas na aba `Janeiro`. São apresentadas na sintaxe interna do arquivo Excel, que utiliza nomes de funções em inglês.

| Indicador | Célula | Fórmula | Significado |
| --- | --- | --- | --- |
| Total de gastos | `D5` | `=SUM(D10,M10,D59)` | Soma despesas fixas, variáveis e faturas. |
| Recebimentos | `F5` | `=SUM(H63:H69)` | Soma os recebimentos do mês. |
| Total pago | `H5` | `=SUM(G10,P10,D60)` | Soma despesas e faturas marcadas como pagas. |
| Faltam a pagar | `J5` | `=D5-H5` | Diferença entre gastos totais e pagamentos. |
| Investido | `L5` | `=X12` | Total de aportes do bloco de investimentos. |
| Saldo disponível | `N5` | `=F5-H5-L5` | Recebimentos menos pagamentos realizados e investimentos. |

O saldo disponível da planilha desconta os pagamentos realizados. Despesas ainda pendentes permanecem no indicador **Faltam a pagar** e não são descontadas por essa fórmula.

Os totais dos blocos usam `SUBTOTAL(9, intervalo)` e `SUMIF(intervalo_status,"PAGO",intervalo_valores)`. Por exemplo:

```excel
=SUBTOTAL(9,F13:F51)
=SUMIF(G13:G51,"PAGO",F13:F51)
=SUBTOTAL(9,X15:X43)
```

`SUBTOTAL` com código 9 soma valores e desconsidera linhas removidas por filtro. `SUMIF` totaliza os valores cujo status corresponde a `PAGO`.

### Vencimentos e recorrências

As células de situação usam `IF` e `TODAY()` para exibir pagamento, ausência de data, atraso ou dias até o vencimento. A avaliação varia conforme a data em que o Excel recalcula o arquivo.

Algumas células dos meses seguintes referenciam a aba anterior para reaproveitar informações. Um exemplo de avanço de vencimento é:

```excel
=IF(Janeiro!D13<>"",DATE(YEAR(Janeiro!D13),MONTH(Janeiro!D13)+1,DAY(Janeiro!D13)),"")
```

Essa fórmula avança o mês mantendo o dia informado. Como `DATE` normaliza datas, um dia inexistente no mês seguinte pode avançar para o mês posterior. Alterações em uma célula anterior também podem afetar os meses que a referenciam.

## Distribuição de renda 50/30/20

As abas mensais incluem um bloco de planejamento que aplica percentuais a uma base de renda informada em `S15`:

| Destinação | Percentual padrão | Fórmula |
| --- | --- | --- |
| Gastos fixos | 50% em `S17` | `=S15*S17` |
| Gastos variáveis | 30% em `S20` | `=S15*S20` |
| Investimentos | 20% em `S23` | `=S15*S23` |

Esses valores são limites de planejamento calculados sobre a base informada. A célula `S15` é uma entrada separada do total de recebimentos em `F5`; o usuário precisa mantê-la atualizada para que a distribuição corresponda à renda do período.

## Consolidação anual e dashboard

A aba `Base` possui uma linha por mês e recebe diretamente os indicadores das abas mensais. Por exemplo, `Base!C3` referencia `Janeiro!D5`, e `Base!E3` referencia `Janeiro!F5`.

A aba `DM` agrega dados da `Base` usando `SUM`, `SUMIF` e divisões para calcular a participação dos recebimentos de cada mês no total anual. O dashboard lê os resultados dessa consolidação:

| Indicador do dashboard | Origem |
| --- | --- |
| Receita total | `DM!R1`, que soma `Base!E:E` |
| Gasto total | `DM!O1`, que soma `Base!C:C` |
| Total pago | `DM!J1`, que soma `Base!G:G` |
| A pagar | `DM!L1`, que soma `Base!I:I` |
| Investimentos | `DM!S1` |

O fluxo principal é **lançamentos mensais → Base → DM → DASHBOARD**. A aba `Tabela dinâmica 2` também apresenta uma consolidação de gastos e recebimentos por mês.

## Reserva de emergência e patrimônio

A aba `RESERVA DE EMERGÊNCIA 2026` separa as metas mensais, em `G8:R8`, dos depósitos realizados, em `G9:R9`.

| Resultado | Fórmula |
| --- | --- |
| Meta anual | `=SUM(G8:R8)` |
| Valor depositado | `=SUM(G9:R9)` |
| Percentual cumprido | `=H5/E5` |

A aba `Rendimento` apresenta referências de reserva equivalentes a 3, 6, 9 e 12 meses de despesas, além de marcos de patrimônio e orientações sobre reinvestimento. Na versão analisada, essa aba contém valores e textos estáticos, sem fórmulas. Ela não executa uma simulação automática de juros compostos ou de rentabilidade.

## Limitações identificadas na planilha original

- **Situação das despesas fixas:** em `Janeiro!E13`, a fórmula verifica `H13="PAGO"`, embora o status esteja em `G13` e `H13` seja a instituição de pagamento. Essa referência pode exibir uma situação incompatível com o pagamento registrado.
- **Intervalos diferentes:** alguns totais terminam na linha 51, enquanto os blocos chegam à linha 52. O total de cartões usa `D63:D68`, mas os pagamentos usam linhas 63 a 69. Lançamentos nas linhas adicionais podem produzir diferenças entre total e valor pago.
- **Investimentos no dashboard:** `DM!S1` referencia somente `S4`. Esse vínculo precisa ser revisado antes de interpretar o indicador como soma anual dos investimentos.
- **Reserva:** o percentual `H5/E5` não possui proteção explícita contra uma meta anual igual a zero.
- **Data do depósito:** o campo rotulado como último depósito utiliza `TEXT(NOW(),"mmmm")`, que mostra o mês atual, sem buscar a data do último depósito efetivo.
- **Categorias:** o cadastro original contém uma categoria repetida e a grafia `Eduação`. O importador remove duplicidades e normaliza essa grafia.

A análise leu as fórmulas e os resultados armazenados no arquivo. Não foram encontrados erros nas células com resultados em cache, mas não foi realizada uma nova recalculação no Excel. As limitações acima estão documentadas; esta alteração de README não corrige a planilha.

## Importação para o aplicativo

O script [`export_financas.py`](export_financas.py) lê o Excel com `openpyxl` em dois modos: fórmulas (`data_only=False`) e resultados armazenados (`data_only=True`). O resultado é gravado em [`controle-financeiro/lib/initial-data.json`](controle-financeiro/lib/initial-data.json).

O processo:

- Converte valores monetários para centavos inteiros com `round(valor * 100)`.
- Converte datas para o formato `AAAA-MM-DD`.
- Classifica registros como `fixed`, `variable`, `card`, `income`, `investment` ou `reserve`.
- Interpreta `PAGO` como indicador booleano de pagamento.
- Preserva a origem de cada lançamento, como `Janeiro!F13`.
- Identifica vínculos de recorrência quando a célula de valor contém uma fórmula em um mês posterior a janeiro.
- Importa depósitos da reserva e atribui uma data aproximada no primeiro dia do mês, marcada por `dateApproximate`.
- Importa cadastros, metas mensais e textos de ajuda.

O importador atual assume o ano de 2026, a ordem original das abas e intervalos fixos. Define janeiro a agosto como realizados e setembro a dezembro como previstos. Essa classificação pertence à configuração da importação, não a uma validação automática dos lançamentos. Alterar o layout ou o ano da planilha exige revisar o script.

O `openpyxl` não recalcula fórmulas. Antes de importar alterações do Excel, é necessário recalcular e salvar a planilha no Excel ou em um programa compatível. O arquivo JSON gerado é uma base inicial; não representa necessariamente o estado atual do banco do aplicativo.

## Aplicativo derivado

O aplicativo amplia o controle original com edição de lançamentos, parcelas entre meses e anos, retiradas da reserva, resgates de investimentos, metas, temas e persistência local.

| Componente | Tecnologia / arquivo |
| --- | --- |
| Interface | React, TypeScript e `app/finance-app.tsx` |
| Regras financeiras | `lib/finance.ts` |
| Compilação local | Vite |
| Servidor local | Python, em `servidor.py` |
| Persistência local | SQLite, em `dados-financeiros.sqlite3` |
| Estrutura preparada para nuvem | Vinext, Cloudflare Workers/D1 e Drizzle |

No aplicativo, reserva e investimentos possuem movimentos de entrada e saída. O caixa considera recebimentos menos despesas pagas e aportes, acrescido das retiradas. Há também um cálculo de disponibilidade que desconta todas as despesas, inclusive pendentes. Essas regras adicionais estão implementadas em `lib/finance.ts`.

A importação não cria sincronização automática entre Excel e aplicativo. Os lançamentos atuais ficam no banco local, que deve ser preservado separadamente. O caminho de deploy na Vercel utiliza Next.js e acesso ao D1 por HTTP, conforme [`controle-financeiro/VERCEL.md`](controle-financeiro/VERCEL.md). A configuração do banco remoto, a migração dos dados atuais e o login com isolamento por usuário permanecem pendentes.

Para detalhes sobre operação, persistência e desenvolvimento, consulte [`DOCUMENTACAO-E-RETOMADA.md`](DOCUMENTACAO-E-RETOMADA.md) e [`controle-financeiro/COMO-USAR.md`](controle-financeiro/COMO-USAR.md).
