// Smart intent → calculator routing (no AI needed — pattern matching)

const ROUTES = [
  {
    id: 'retirement',
    patterns: ['retire', 'retirement', 'pension', 'financial freedom', 'fire', 'stop working', 'early retirement', 'retire at', 'how much to retire'],
    response: (q) => `Routing to Retirement Planner — let's calculate the corpus you need.`,
  },
  {
    id: 'readiness',
    patterns: ['readiness', 'retirement score', 'how ready', 'am i ready', 'networth', 'net worth', 'assets', 'retirement corpus', 'readiness dashboard'],
    response: () => `Opening Retirement Readiness Dashboard — enter all your assets for a full picture.`,
  },
  {
    id: 'sip',
    patterns: ['sip', 'monthly invest', 'invest every month', 'monthly sip', 'how much sip', 'start sip', 'mutual fund sip', 'mf sip', 'regular invest'],
    response: () => `Let's open the SIP Calculator — adjust the slider to see your corpus grow in real time.`,
  },
  {
    id: 'stepup',
    patterns: ['step up', 'increase sip', 'salary hike', 'hike sip', 'increase investment yearly', 'step-up', 'grow sip'],
    response: () => `Opening Step-Up SIP — see how increasing your SIP by 10% yearly changes everything.`,
  },
  {
    id: 'lumpsum',
    patterns: ['lumpsum', 'lump sum', 'one time', 'invest once', 'single investment', 'bonus invest', 'windfall', 'inherited', 'invest today'],
    response: () => `Opening Lumpsum Calculator — enter the amount and see how it grows.`,
  },
  {
    id: 'goal',
    patterns: ['goal', 'house', 'home', 'car', 'education', 'college', 'wedding', 'vacation', 'travel', 'startup', 'dream', 'save for', 'planning for', 'save towards'],
    response: () => `Let's plan your goal — pick it from the list and find your monthly SIP.`,
  },
  {
    id: 'emi',
    patterns: ['emi', 'loan', 'home loan', 'car loan', 'personal loan', 'borrow', 'mortgage', 'interest', 'equated monthly', 'repay', 'debt'],
    response: () => `Opening EMI Calculator — find your monthly payment and total interest cost.`,
  },
  {
    id: 'tax',
    patterns: ['tax', 'income tax', 'new regime', 'old regime', 'itr', 'tds', '80c', 'deduction', 'how much tax', 'tax saving', 'tax slab'],
    response: () => `Opening Income Tax Calculator — compare new vs old regime.`,
  },
  {
    id: 'salary',
    patterns: ['salary', 'ctc', 'in hand', 'take home', 'inhand', 'gross salary', 'hra', 'gratuity', 'cost to company', 'net salary'],
    response: () => `Let's decode your CTC — find your actual in-hand salary, HRA exemption, and gratuity.`,
  },
  {
    id: 'budget',
    patterns: ['budget', 'expense', 'spending', '50 30 20', 'monthly budget', 'where does money go', 'track spend', 'allocate salary'],
    response: () => `Opening Budget Planner — use the 50/30/20 rule to allocate your income.`,
  },
  {
    id: 'inflation',
    patterns: ['inflation', 'future cost', 'purchasing power', 'value of money', 'cost in future', 'what will cost', 'price rise', 'real return'],
    response: () => `Opening Inflation Calculator — see what things cost in the future.`,
  },
  {
    id: 'cagr',
    patterns: ['cagr', 'annual return', 'compound return', 'return rate', 'how much return', 'what return', 'annualised', 'performance', 'portfolio return'],
    response: () => `Opening CAGR Calculator — find the true annualised return on any investment.`,
  },
  {
    id: 'multiplier',
    patterns: ['double', '2x', '5x', '10x', '20x', '100x', 'multiply', 'triple', 'how long to double', 'rule of 72', 'when will money'],
    response: () => `Opening Money Multiplier — see when your money doubles, triples, or 10×.`,
  },
  {
    id: 'fdppf',
    patterns: ['fd', 'fixed deposit', 'ppf', 'nps', 'rd', 'recurring deposit', 'safe investment', 'guaranteed return', 'savings scheme', 'post office'],
    response: () => `Opening FD / PPF / NPS Calculator — guaranteed returns with tax benefits.`,
  },
  {
    id: 'swp',
    patterns: ['swp', 'withdrawal', 'monthly income', 'income from corpus', 'retire income', 'draw down', 'pension plan', 'corpus withdrawal', 'passive income'],
    response: () => `Opening Withdrawal Planner — how long will your corpus last with monthly withdrawals?`,
  },
  {
    id: 'compare',
    patterns: ['compare', 'vs', 'versus', 'which is better', 'fd vs mf', 'ppf vs elss', 'best investment', 'where to invest', 'which investment'],
    response: () => `Opening Investment Comparison — FD vs PPF vs Equity MF vs NPS, side by side.`,
  },
];

export function findCalculator(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  for (const route of ROUTES) {
    if (route.patterns.some(p => q.includes(p))) {
      return { id: route.id, message: route.response(q) };
    }
  }

  // Fallback: number-based routing
  if (/\d+\s*(lakh|cr|crore|l\b)/.test(q)) return { id: 'lumpsum', message: 'Looks like you have a specific amount — let\'s open the Lumpsum Calculator.' };
  if (/\d+\s*%/.test(q)) return { id: 'cagr', message: 'Return rate question — let\'s open the CAGR Calculator.' };
  if (/\d+\s*(year|yr)/.test(q)) return { id: 'goal', message: 'Time-based goal — let\'s plan it with the Goal Planner.' };

  return null;
}

export const EXAMPLE_QUERIES = [
  'I want to retire at 50',
  'How much SIP for ₹1 crore?',
  'What is my in-hand from 15 LPA CTC?',
  'EMI for 50 lakh home loan',
  'New regime or old regime for 12 LPA?',
  'When will ₹1 lakh become 10 lakhs?',
  'How much will ₹10,000/month become in 20 years?',
  'Compare FD vs mutual fund',
  'How much corpus for retirement?',
  'Inflation impact on my expenses',
];
