// Smart intent router — scoring-based, handles natural conversational queries
// No API, no AI — pure keyword intent matching with confidence scoring

const CALCS = [
  {
    id: 'retirement',
    label: 'Retirement Planner',
    // High-weight: very specific intent signals
    high: ['retire', 'retirement', 'financial freedom', 'fire movement', 'stop working', 'quit job', 'work optional', 'passive income retire', 'retire early', 'retire at', 'pension plan', 'post retirement'],
    // Medium-weight: partial signals
    med: ['corpus', 'old age', 'life after work', 'when can i', 'when should i', 'how much corpus', 'enough to retire', 'independence'],
    // Low-weight: common words that hint at this
    low: ['future', 'plan', 'corpus needed', 'need money', 'how much do i need', 'how much i need', 'need', 'comfortable life'],
    response: 'Retirement Planner — calculate exactly how much corpus you need and what SIP to get there.',
  },
  {
    id: 'sip',
    label: 'SIP Calculator',
    high: ['sip', 'systematic investment', 'monthly invest', 'monthly sip', 'mutual fund sip', 'mf sip', 'elss', 'mutual fund'],
    med: ['invest monthly', 'invest every month', 'regular investment', 'how much sip', 'start investing', 'where to invest monthly', 'grow money monthly'],
    low: ['invest', 'investment', 'grow money', 'wealth', 'returns', 'monthly'],
    response: 'SIP Calculator — see your monthly investment grow into a corpus in real time.',
  },
  {
    id: 'goal',
    label: 'Goal Planner',
    high: ['house', 'home', 'flat', 'apartment', 'car', 'education', 'college', 'wedding', 'marriage', 'vacation', 'travel', 'world tour', 'startup', 'business', 'dream'],
    med: ['goal', 'save for', 'saving for', 'planning for', 'target', 'achieve', 'by age', 'in 5 years', 'in 10 years', 'need money for', 'want to buy'],
    low: ['planning', 'future', 'purchase', 'need', 'want'],
    response: 'Goal Planner — pick your dream, set the timeline, get the exact SIP needed.',
  },
  {
    id: 'lumpsum',
    label: 'Lumpsum Calculator',
    high: ['lumpsum', 'lump sum', 'one time investment', 'invest once', 'single payment', 'windfall', 'inherited', 'bonus invest', 'gratuity invest', 'esop', 'proceeds'],
    med: ['invest today', 'invest now', 'park money', 'idle money', 'sitting money', 'fixed amount', 'large amount'],
    low: ['amount', 'invest', 'put money', 'deploy'],
    response: 'Lumpsum Calculator — see how a one-time amount grows with compounding.',
  },
  {
    id: 'stepup',
    label: 'Step-Up SIP',
    high: ['step up', 'step-up', 'stepup', 'increase sip', 'growing sip', 'hike sip', 'top up sip'],
    med: ['salary hike', 'raise sip', 'increment', 'annual increase', 'yearly increase', 'increase every year'],
    low: ['increase', 'grow sip', 'more every year'],
    response: 'Step-Up SIP — increase your SIP with your salary hike and see the massive difference.',
  },
  {
    id: 'emi',
    label: 'EMI Calculator',
    high: ['emi', 'home loan', 'car loan', 'personal loan', 'education loan', 'gold loan', 'mortgage', 'equated monthly'],
    med: ['loan', 'borrow', 'repay', 'bank loan', 'interest rate loan', 'credit', 'debt', 'monthly payment', 'installment'],
    low: ['finance', 'bank', 'interest'],
    response: 'EMI Calculator — monthly payment, total interest, and full repayment schedule.',
  },
  {
    id: 'tax',
    label: 'Income Tax Calculator',
    high: ['income tax', 'new regime', 'old regime', 'itr', 'tds', '80c', '80d', 'tax slab', 'tax deduction', 'tax saving', 'cess', 'surcharge'],
    med: ['tax', 'how much tax', 'tax liability', 'which regime', 'save tax', 'tax benefit', 'tax return', 'pay less tax'],
    low: ['regime', 'deduction', 'exemption', 'taxable'],
    response: 'Income Tax Calculator — compare New vs Old regime and see your monthly take-home.',
  },
  {
    id: 'salary',
    label: 'CTC & Salary',
    high: ['ctc', 'cost to company', 'in hand', 'inhand', 'take home', 'net salary', 'hra exemption', 'gratuity', 'salary slip', 'basic salary'],
    med: ['salary', 'lpa', 'package', 'gross salary', 'monthly salary', 'annual salary', 'what is my salary', 'decode salary'],
    low: ['income', 'earning', 'pay'],
    response: 'Salary Calculator — decode your CTC into actual in-hand amount, HRA exemption, gratuity.',
  },
  {
    id: 'inflation',
    label: 'Inflation Calculator',
    high: ['inflation', 'purchasing power', 'price rise', 'cost inflation', 'real return', 'inflation adjusted', 'rising prices'],
    med: ['future cost', 'cost in future', 'value of money', 'money worth', 'what will cost', 'cost after', 'how much will'],
    low: ['price', 'expensive', 'cost more', 'value'],
    response: 'Inflation Calculator — see future costs and what your money is really worth after inflation.',
  },
  {
    id: 'cagr',
    label: 'CAGR Calculator',
    high: ['cagr', 'compounded annual growth', 'annualised return', 'compound return', 'absolute return to cagr'],
    med: ['annual return', 'return rate', 'what return', 'portfolio performance', 'investment performance', 'how much return', 'what grew'],
    low: ['return', 'performance', 'growth rate', 'grew'],
    response: 'CAGR Calculator — find the true annual return rate on any investment.',
  },
  {
    id: 'multiplier',
    label: 'Money Multiplier',
    high: ['double money', '2x money', '5x', '10x', '100x', 'triple money', 'multiply money', 'rule of 72', 'when will money double', 'how long to double'],
    med: ['double', 'multiply', 'how long to', 'time to grow', 'when will', 'when does'],
    low: ['times', 'fold', 'grow to', 'become'],
    response: 'Money Multiplier — see when your money 2×, 5×, 10× at any return rate.',
  },
  {
    id: 'compare',
    label: 'Investment Comparison',
    high: ['compare investments', 'fd vs mf', 'ppf vs elss', 'which is better investment', 'equity vs debt', 'best investment option', 'nps vs ppf'],
    med: ['compare', 'vs', 'versus', 'which is better', 'best option', 'where to invest', 'which investment', 'alternatives'],
    low: ['better', 'difference', 'option'],
    response: 'Investment Comparison — same money across FD, PPF, Equity MF, NPS side by side.',
  },
  {
    id: 'fdppf',
    label: 'FD / PPF / NPS',
    high: ['fixed deposit', 'ppf', 'public provident fund', 'recurring deposit', 'nps', 'national pension', 'post office scheme', 'kisan vikas', 'sukanya'],
    med: ['fd', 'rd', 'safe investment', 'guaranteed return', 'risk free', 'bank deposit', 'savings scheme'],
    low: ['safe', 'guaranteed', 'no risk', 'bank'],
    response: 'FD / PPF / NPS Calculator — maturity amounts for all safe, guaranteed instruments.',
  },
  {
    id: 'swp',
    label: 'Withdrawal Planner',
    high: ['swp', 'systematic withdrawal', 'monthly income from corpus', 'corpus withdrawal', 'drawdown', 'retirement income', 'how long corpus last'],
    med: ['withdrawal', 'withdraw monthly', 'income from investment', 'sustain corpus', 'monthly payout', 'how much can i withdraw', 'passive income'],
    low: ['withdraw', 'payout', 'income'],
    response: 'Withdrawal Planner (SWP) — how much can you safely withdraw from your corpus every month?',
  },
  {
    id: 'budget',
    label: 'Budget Planner',
    high: ['budget', '50 30 20', 'monthly budget', 'budget planner', 'expense tracker', 'spending plan', 'allocate salary'],
    med: ['expenses', 'spending', 'where does money go', 'manage money', 'track expenses', 'how to save more', 'savings rate'],
    low: ['expense', 'spend', 'save', 'manage'],
    response: 'Budget Planner — 50/30/20 rule to allocate your income across needs, wants, and savings.',
  },
  {
    id: 'timeline',
    label: 'Financial Timeline',
    high: ['financial timeline', 'life plan', 'financial plan', 'life goals timeline', 'all goals together'],
    med: ['plan my life', 'everything together', 'big picture', 'full picture', 'overview', 'where am i', 'financial journey'],
    low: ['plan', 'journey', 'life'],
    response: 'Financial Timeline — see your entire financial life from today to retirement on one live canvas.',
  },
  {
    id: 'readiness',
    label: 'Retirement Readiness',
    high: ['retirement readiness', 'readiness score', 'am i ready to retire', 'readiness dashboard', 'how ready am i'],
    med: ['ready', 'net worth', 'total assets', 'all assets', 'existing investments', 'shortfall', 'retirement score'],
    low: ['ready', 'score', 'check'],
    response: 'Readiness Dashboard — enter all your assets and get a retirement readiness score out of 100.',
  },
];

// Score a query against a calculator
function score(q, calc) {
  let s = 0;
  for (const kw of calc.high) { if (q.includes(kw)) s += 10; }
  for (const kw of calc.med)  { if (q.includes(kw)) s += 4; }
  for (const kw of calc.low)  { if (q.includes(kw)) s += 1; }
  return s;
}

// Intent-level patterns before keyword scoring (for very common phrasings)
const INTENT_PATTERNS = [
  // "how much do I need" → context-dependent, try retirement first
  { pattern: /how much (do i |i |should i )?(need|save|invest|keep|have)/i, id: 'retirement', boost: 8 },
  // "how much will X become"
  { pattern: /how much will .+ become/i, id: 'sip', boost: 8 },
  { pattern: /how much will .+ grow/i, id: 'sip', boost: 8 },
  // "what is my EMI"
  { pattern: /what (is |will be )?my emi/i, id: 'emi', boost: 15 },
  // "when can I retire"
  { pattern: /when can i (retire|stop working|be free)/i, id: 'retirement', boost: 15 },
  // "is X enough to retire"
  { pattern: /(is .+ enough|enough (to retire|for retirement))/i, id: 'readiness', boost: 10 },
  // "what is X in hand / take home"
  { pattern: /(in.?hand|take.?home|net salary) (for|from|on|of)/i, id: 'salary', boost: 15 },
  // "should I choose new or old regime"
  { pattern: /(new or old|old or new) regime/i, id: 'tax', boost: 15 },
  // "how much tax on X"
  { pattern: /how much tax (on|for|do i)/i, id: 'tax', boost: 12 },
  // "I have X lakhs"
  { pattern: /(i have|have) [\d.]+ (lakh|l|cr|crore)/i, id: 'lumpsum', boost: 6 },
  // "I want to buy a X"
  { pattern: /(want to buy|buying|planning to buy|purchase)/i, id: 'goal', boost: 8 },
  // "how long will corpus last"
  { pattern: /how long (will|can) .*(corpus|money|savings|fund) (last|sustain)/i, id: 'swp', boost: 15 },
  // "double/triple my money"
  { pattern: /(double|triple|10x|5x) my money/i, id: 'multiplier', boost: 15 },
  // "what will ₹X cost in Y years"
  { pattern: /what will .+ cost in/i, id: 'inflation', boost: 12 },
  // "compare X vs Y"
  { pattern: /compare .+ (vs|versus|or) .+/i, id: 'compare', boost: 10 },
];

export function findCalculator(query) {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return null;

  // Build scores — start with keyword scoring for all calcs
  const scores = CALCS.map(calc => ({ ...calc, s: score(q, calc) }));

  // Apply intent pattern boosts
  for (const intent of INTENT_PATTERNS) {
    if (intent.pattern.test(query)) {
      const match = scores.find(c => c.id === intent.id);
      if (match) match.s += intent.boost;
    }
  }

  // Find best match with minimum threshold
  const best = scores.reduce((a, b) => (b.s > a.s ? b : a));

  if (best.s < 2) {
    // No good match — try number extraction as last resort
    if (/(\d[\d,.]+)\s*(lakh|l\b|cr|crore)/i.test(query)) {
      return { id: 'lumpsum', message: 'Looks like you have a specific amount in mind — opening Lumpsum Calculator.' };
    }
    if (/(\d+)\s*(year|yr|years)/i.test(query)) {
      return { id: 'goal', message: 'Time-based target — let\'s plan it with the Goal Planner.' };
    }
    if (/\d+\s*%/.test(query)) {
      return { id: 'cagr', message: 'Return rate question — opening CAGR Calculator.' };
    }
    return null;
  }

  // Confidence label
  const confidence = best.s >= 10 ? 'high' : best.s >= 4 ? 'medium' : 'low';

  return {
    id: best.id,
    label: best.label,
    confidence,
    message: best.response,
  };
}

// "Did you mean?" suggestions when query is partial / no match
export function getSuggestions(query) {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 2) return [];
  const scored = CALCS.map(c => ({ id: c.id, label: c.label, s: score(q, c) })).filter(c => c.s > 0).sort((a, b) => b.s - a.s);
  return scored.slice(0, 3);
}

export const EXAMPLE_QUERIES = [
  'How much do I need to retire at 55?',
  'EMI for ₹50L home loan at 8.5% for 20 years',
  'New regime or old regime for ₹15 LPA?',
  'What does ₹10,000/month SIP become in 15 years?',
  'When will my ₹1 lakh become ₹10 lakh?',
  'How much will my child\'s college cost in 2040?',
  'Is ₹2 crore enough to retire?',
  'Compare FD vs mutual fund for 10 years',
  'In-hand salary for ₹18 LPA CTC',
  'How much SIP for ₹1 crore in 10 years?',
  'How much do I need to save for a house?',
  'I want to retire in 15 years, how much?',
];
