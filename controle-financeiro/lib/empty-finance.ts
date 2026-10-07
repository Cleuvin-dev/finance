import type { Finance } from './finance';

export function emptyFinance(year = Number(new Intl.DateTimeFormat('en', {
  year: 'numeric', timeZone: 'America/Sao_Paulo',
}).format(new Date()))): Finance {
  return {
    year, records: [],
    categories: ['Casa', 'Transporte', 'Pessoal', 'Alimentação', 'Educação', 'Assinaturas', 'Avulsos', 'Cartão de crédito'],
    banks: [], cards: [], monthlyTargets: Array(12).fill(0), allocation: [50, 30, 20],
    essentialMonthlyCents: 0, wealthCents: 0, wealthGoals: [],
    monthStates: Array(12).fill('realizado'), yearMonthStates: {}, sourceSheets: [], help: [],
  };
}
