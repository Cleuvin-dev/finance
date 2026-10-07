# Controle financeiro

Abra **Iniciar controle financeiro.bat**. O navegador abrirá o painel em http://localhost:8765. Mantenha a janela do servidor aberta enquanto usa a página.

O aplicativo já contém os lançamentos de FINANÇAS.xlsx. Você pode criar, editar, excluir e marcar pagamentos; os resultados são recalculados automaticamente. As alterações ficam no arquivo **dados-financeiros.sqlite3**, nesta pasta. Faça uma cópia desse arquivo, com o servidor fechado, para guardar um backup completo.

Para inserir valores, use **Novo lançamento**, escolha o tipo e preencha valor, mês e data. Em **Reserva e patrimônio**, há atalhos **Adicionar investimento** (um aporte novo, descontado do caixa) e **Depositar na reserva**. O patrimônio e suas metas somam automaticamente os lançamentos do tipo Investimento. Em **Ajustar metas → Saldo inicial dos investimentos**, informe apenas o patrimônio anterior aos aportes registrados, sem a reserva. Resgates registrados são descontados automaticamente; rendimentos não são calculados automaticamente.

O botão **Modo escuro / Modo claro**, no topo, alterna a aparência e salva sua preferência neste navegador. Ao acessar pela primeira vez, acompanha a preferência de cores do sistema.

O último mês e ano selecionados também são lembrados neste navegador, inclusive após atualizar ou fechar a página. Essa preferência não altera os lançamentos financeiros.

O botão Exportar CSV salva os lançamentos para consulta em planilhas. A página não modifica o Excel original e não sincroniza alterações futuras feitas nele.

O controle funciona sem internet. O acesso local usa apenas este computador; não abra o arquivo HTML diretamente. Não é necessário instalar os pacotes de desenvolvimento para usar a versão pronta, apenas Python (já disponível neste computador).

A versão preparada para Sites usa banco D1 e publicação privada. A publicação online não foi concluída porque o ambiente não conseguiu acessar o repositório de publicação. O projeto privado foi registrado; uma futura publicação deve reutilizar o project_id presente em .openai/hosting.json.

Os depósitos na reserva são deduzidos do caixa e incluídos nos aportes. Setembro a dezembro foram importados como previstos. As despesas recorrentes atualizam os meses seguintes vinculados. A aba Ajuda explica os cálculos e as correções aplicadas.

A reserva foi zerada a pedido do usuário. Os investimentos existentes foram preservados; a cópia anterior ao reset está no arquivo backup-antes-zerar-reserva-*.sqlite3. Os gráficos da reserva usam apenas depósitos na reserva; os gráficos de patrimônio usam investimentos.

Nos quadros de Reserva e patrimônio, use **Retirar da reserva** ou **Resgatar investimento**. Informe um valor positivo, mês e data. A retirada reduz apenas seu saldo correspondente, atualiza o Acúmulo total e devolve o dinheiro ao caixa do mês. Não é classificada como receita. Registre separadamente as despesas que pagar com esse dinheiro. Valores superiores ao saldo disponível são bloqueados. Os registros ficam no Controle mensal e podem ser editados.

Ao cadastrar uma nova despesa em **Novo lançamento**, escolha **Mês da primeira cobrança**, **Ano da primeira cobrança**, **Número de parcelas** e **Valor de cada parcela**. O mês do cadastro não precisa ser o mês da primeira cobrança. Exemplo: R$ 200 por parcela, 3 parcelas, início novembro de 2026 cria novembro/2026, dezembro/2026 e janeiro/2027, totalizando R$ 600. O dia de vencimento é repetido, ajustando para o último dia nos meses mais curtos. As parcelas futuras começam como pendentes e podem ser editadas individualmente. Use o seletor **Ano**, no topo, para consultar janeiro e os demais meses do próximo ano. Parcelamentos não dividem o valor informado: ele já deve ser o valor de cada parcela.

A tabela **Aportes e metas mensais** compara a meta do mês com investimentos + depósitos na reserva − resgates e retiradas. Um investimento de R$ 98 em outubro reduz uma meta de R$ 1.000 para R$ 902 restantes. O saldo inicial dos investimentos não é contado como aporte mensal. Reserva e patrimônio continuam separados nos quadros de saldo.

Em **Cadastros → Cadastros disponíveis**, o botão × de cada banco, cartão e categoria permite removê-lo da lista. Confirme a remoção; os lançamentos antigos que utilizam esse cadastro são preservados. Você pode adicionar o item novamente pelo formulário Editar cadastros.

O quadro **Reserva + investimentos**, na visão geral, mostra o mesmo Acúmulo total da aba Reserva e patrimônio: saldo líquido da reserva + saldo inicial dos investimentos + aportes − resgates. Seu percentual compara esse total guardado com a meta anual.
