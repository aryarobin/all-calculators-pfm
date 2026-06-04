// Single source of truth for every calculator: id, URL slug, nav grouping,
// and SEO metadata. Imported by App (routing/nav) and the sitemap.
// No component imports here so this stays importable anywhere.

export const CALCULATORS = [
  // ── Investments ──
  { id: 'sip', slug: 'sip-calculator', name: 'SIP Calculator', group: 'Investments',
    seoTitle: 'SIP Calculator — Mutual Fund SIP Returns Calculator | GoalFi',
    seoDesc: 'Free SIP calculator with live charts. See how your monthly mutual fund SIP grows over time, total returns, and wealth multiple. Built for Indian investors.' },
  { id: 'lumpsum', slug: 'lumpsum-calculator', name: 'Lumpsum Calculator', group: 'Investments',
    seoTitle: 'Lumpsum Calculator — One-Time Investment Returns | GoalFi',
    seoDesc: 'Calculate the future value of a one-time lumpsum investment with compounding. See when your money doubles, triples, or 10×. Free, with live charts.' },
  { id: 'stepup', slug: 'step-up-sip-calculator', name: 'Step-Up SIP', group: 'Investments',
    seoTitle: 'Step-Up SIP Calculator — Annual Increase SIP | GoalFi',
    seoDesc: 'See how increasing your SIP every year (with your salary hike) dramatically boosts your final corpus vs a flat SIP. Free step-up SIP calculator.' },
  { id: 'compare', slug: 'investment-comparison', name: 'Compare Instruments', group: 'Investments',
    seoTitle: 'Investment Comparison — FD vs PPF vs Mutual Fund vs NPS | GoalFi',
    seoDesc: 'Compare FD, PPF, ELSS, Equity MF, NPS and Gold side by side — pre-tax and post-tax returns on the same monthly investment. Free comparison tool.' },

  // ── Goals & Retirement ──
  { id: 'goal', slug: 'goal-planning-calculator', name: 'Goal Planning', group: 'Goals & Retirement',
    seoTitle: 'Goal Planning Calculator — SIP for Home, Education, Car | GoalFi',
    seoDesc: 'Plan any financial goal — home, child education, car, wedding. Get the inflation-adjusted target and the exact monthly SIP needed. Free goal calculator.' },
  { id: 'retirement', slug: 'retirement-calculator', name: 'Retirement Planner', group: 'Goals & Retirement',
    seoTitle: 'Retirement Calculator — How Much Do You Need to Retire | GoalFi',
    seoDesc: 'Find the corpus you need to retire and the monthly SIP to get there, inflation-adjusted. Free retirement planning calculator for India.' },
  { id: 'readiness', slug: 'retirement-readiness', name: 'Readiness Dashboard', group: 'Goals & Retirement',
    seoTitle: 'Retirement Readiness Score — Are You On Track? | GoalFi',
    seoDesc: 'Enter all your assets — FD, PPF, MF, stocks, gold — and get a retirement readiness score out of 100, with the extra SIP needed to close any gap.' },
  { id: 'swp', slug: 'swp-calculator', name: 'Income & Withdrawal', group: 'Goals & Retirement',
    seoTitle: 'SWP Calculator — Systematic Withdrawal & Income Planning | GoalFi',
    seoDesc: 'Two-way SWP calculator: find how much to invest now for a target monthly income later, or check if your corpus can sustain your withdrawals. Free.' },
  { id: 'fire', slug: 'financial-freedom-calculator', name: 'Financial Freedom (FIRE)', group: 'Goals & Retirement',
    seoTitle: 'Financial Freedom Calculator (FIRE) — Retire Now Corpus | GoalFi',
    seoDesc: 'How much do you need to retire today and live off returns forever? FIRE number for India — after tax, comparing FD vs Equity MF vs your target return.' },
  { id: 'coast', slug: 'coast-fire-calculator', name: 'Coast FIRE', group: 'Goals & Retirement',
    seoTitle: 'Coast FIRE Calculator — When Can You Stop Investing? | GoalFi',
    seoDesc: 'Coast FIRE calculator for India: find the corpus where compounding alone reaches your retirement number — so you can stop investing aggressively and coast.' },

  // ── Smart Decisions ──
  { id: 'prepay', slug: 'loan-prepayment-vs-investment-calculator', name: 'Prepay vs Invest', group: 'Smart Decisions',
    seoTitle: 'Home Loan Prepayment vs Investment Calculator | GoalFi',
    seoDesc: 'Should you prepay your home loan or invest the surplus? Compare both paths to final net worth — accounts for loan rate vs post-tax investment return.' },
  { id: 'rentbuy', slug: 'rent-vs-buy-calculator', name: 'Rent vs Buy', group: 'Smart Decisions',
    seoTitle: 'Rent vs Buy Calculator India — Which Builds More Wealth? | GoalFi',
    seoDesc: 'Rent vs buy a home in India: compare net worth after N years of buying (equity + appreciation) vs renting and investing the difference. Free calculator.' },
  { id: 'insurevsinvest', slug: 'insurance-vs-investment-calculator', name: 'Insurance vs Investment', group: 'Smart Decisions',
    seoTitle: 'Insurance vs Investment — Term + Invest vs ULIP / LIC | GoalFi',
    seoDesc: 'Should you buy a ULIP or LIC endowment, or buy term insurance and invest the rest? See how "Buy Term + Invest the Difference" builds far more wealth. Free.' },
  { id: 'lumpvssip', slug: 'lumpsum-vs-sip-calculator', name: 'Lumpsum vs SIP (STP)', group: 'Smart Decisions',
    seoTitle: 'Lumpsum vs SIP / STP Calculator — Deploy a Windfall | GoalFi',
    seoDesc: 'Got a bonus, ESOP or inheritance? Compare investing it all at once vs staggering via STP. See which builds more wealth and the timing-risk trade-off. Free.' },
  { id: 'directregular', slug: 'direct-vs-regular-mutual-fund-calculator', name: 'Direct vs Regular MF', group: 'Smart Decisions',
    seoTitle: 'Direct vs Regular Mutual Fund Calculator — Commission Cost | GoalFi',
    seoDesc: 'See how the higher expense ratio of regular mutual fund plans silently costs you lakhs over time vs direct plans. Same fund, your money. Free calculator.' },
  { id: 'termcover', slug: 'term-insurance-cover-calculator', name: 'Term Cover Needed', group: 'Smart Decisions',
    seoTitle: 'Term Insurance Cover Calculator — How Much Do You Need? | GoalFi',
    seoDesc: 'How much life insurance cover do you really need? Calculate it from income replacement, loans, and goals minus existing assets. Free term cover calculator.' },
  { id: 'xirr', slug: 'xirr-calculator', name: 'XIRR Calculator', group: 'Analysis',
    seoTitle: 'XIRR Calculator — Actual SIP & Mutual Fund Returns | GoalFi',
    seoDesc: 'Calculate XIRR — your true annualised return on SIPs and irregular investments, accounting for the exact timing of every cashflow. Free XIRR calculator.' },

  // ── Analysis ──
  { id: 'timeline', slug: 'financial-timeline', name: 'Financial Timeline', group: 'Analysis',
    seoTitle: 'Financial Timeline — Your Money Life on One View | GoalFi',
    seoDesc: 'See your entire financial life from today to retirement on one interactive timeline — corpus milestones, home, education and loan payoff.' },
  { id: 'cagr', slug: 'cagr-calculator', name: 'CAGR Calculator', group: 'Analysis',
    seoTitle: 'CAGR Calculator — Compound Annual Growth Rate | GoalFi',
    seoDesc: 'Calculate CAGR (compound annual growth rate) of any investment, project future value, and compare return rates. Free CAGR calculator with charts.' },
  { id: 'multiplier', slug: 'money-multiplier-calculator', name: 'Money Multiplier', group: 'Analysis',
    seoTitle: 'Money Multiplier — When Will Money Double, 5×, 10× | GoalFi',
    seoDesc: 'See exactly when your money doubles, triples, 5× or 10× at any return rate (Rule of 72), or the CAGR needed to hit a target multiple. Free tool.' },
  { id: 'inflation', slug: 'inflation-calculator', name: 'Inflation Calculator', group: 'Analysis',
    seoTitle: 'Inflation Calculator — Future Cost & Real Returns | GoalFi',
    seoDesc: 'See what things will cost in the future, what a future amount is worth today, and your real (inflation-adjusted) returns. Free inflation calculator.' },
  { id: 'simplecompound', slug: 'simple-vs-compound-interest-calculator', name: 'Simple vs Compound', group: 'Analysis',
    seoTitle: 'Simple vs Compound Interest Calculator | GoalFi',
    seoDesc: 'See the difference between simple and compound interest over time, with any compounding frequency. Understand why compounding builds wealth. Free.' },
  { id: 'networth', slug: 'net-worth-calculator', name: 'Net Worth Tracker', group: 'Analysis',
    seoTitle: 'Net Worth Calculator — Track Assets vs Liabilities | GoalFi',
    seoDesc: 'Calculate your net worth — total assets (cash, FD, MF, stocks, gold, property) minus liabilities (loans, credit cards). See your asset allocation. Free.' },
  { id: 'crorepati', slug: 'crorepati-calculator', name: 'Crorepati Timeline', group: 'Analysis',
    seoTitle: 'Crorepati Calculator — When Will You Reach ₹1 Crore? | GoalFi',
    seoDesc: 'Find out exactly when your SIP will make you a crorepati, or the SIP needed to reach ₹1 / ₹5 / ₹10 crore by a target date. Free crorepati calculator.' },

  // ── Loans ──
  { id: 'emi', slug: 'emi-calculator', name: 'EMI Calculator', group: 'Loans',
    seoTitle: 'EMI Calculator — Home, Car & Personal Loan EMI | GoalFi',
    seoDesc: 'Calculate your monthly EMI, total interest, and full amortisation schedule for home, car, personal and education loans. Free EMI calculator with charts.' },
  { id: 'creditcard', slug: 'credit-card-payoff-calculator', name: 'Credit Card Payoff', group: 'Loans',
    seoTitle: 'Credit Card Payoff Calculator — Interest & Time to Clear | GoalFi',
    seoDesc: 'See how long to clear your credit card debt and the total interest at 36–48% APR. Avoid the minimum-payment trap. Free credit card payoff calculator.' },

  // ── Savings ──
  { id: 'fdppf', slug: 'fd-rd-ppf-nps-calculator', name: 'FD / RD / PPF / NPS', group: 'Savings',
    seoTitle: 'FD, RD, PPF & NPS Calculator — Maturity & Interest | GoalFi',
    seoDesc: 'Calculate maturity and interest for Fixed Deposit, Recurring Deposit, PPF and NPS. Compare all safe, tax-advantaged instruments. Free calculator.' },
  { id: 'ssy', slug: 'sukanya-samriddhi-calculator', name: 'Sukanya Samriddhi (SSY)', group: 'Savings',
    seoTitle: 'Sukanya Samriddhi Yojana Calculator — SSY Maturity | GoalFi',
    seoDesc: "Calculate Sukanya Samriddhi Yojana (SSY) maturity for your daughter — tax-free EEE returns at 8.2%. See the corpus at age 21. Free SSY calculator." },
  { id: 'emergency', slug: 'emergency-fund-calculator', name: 'Emergency Fund', group: 'Goals & Retirement',
    seoTitle: 'Emergency Fund Calculator — How Many Months Do You Need? | GoalFi',
    seoDesc: 'How big should your emergency fund be? Calculate 3–12 months of expenses, see your coverage, and how long to build it. Free emergency fund calculator.' },

  // ── Tax & Salary ──
  { id: 'tax', slug: 'income-tax-calculator', name: 'Income Tax', group: 'Tax & Salary',
    seoTitle: 'Income Tax Calculator — New vs Old Regime (FY 2024-25) | GoalFi',
    seoDesc: 'Compare New vs Old tax regime, see your exact tax, take-home pay and effective rate. Free income tax calculator for salaried Indians.' },
  { id: 'capgains', slug: 'capital-gains-tax-calculator', name: 'Capital Gains Tax', group: 'Tax & Salary',
    seoTitle: 'Capital Gains Tax Calculator — Equity, Debt, Property, Gold | GoalFi',
    seoDesc: 'Calculate LTCG and STCG tax on shares, mutual funds, property and gold under the FY 2024-25 rules — equity LTCG 12.5% with ₹1.25L exemption. Free.' },
  { id: 'salary', slug: 'salary-ctc-calculator', name: 'CTC & Salary', group: 'Tax & Salary',
    seoTitle: 'CTC to In-Hand Salary Calculator — HRA & Gratuity | GoalFi',
    seoDesc: 'Break down your CTC into actual in-hand salary, calculate HRA exemption and gratuity. Free salary calculator for India.' },
  { id: 'budget', slug: 'budget-planner', name: 'Budget Planner', group: 'Tax & Salary',
    seoTitle: 'Budget Planner — 50/30/20 Rule Calculator | GoalFi',
    seoDesc: 'Plan your monthly budget with the 50/30/20 rule, get a savings health score, and see how your savings grow if invested. Free budget planner.' },
];

export const SITE_URL = 'https://planner.goalfi.app';

// GoalFi's live investment product (research portfolios on smallcase).
// Every "explore / invest with GoalFi" CTA points here.
export const GOALFI_URL = 'https://goalfiresearch.smallcase.com';

export const NAV_GROUP_ORDER = [
  'Investments', 'Goals & Retirement', 'Smart Decisions', 'Analysis', 'Loans', 'Savings', 'Tax & Salary',
];

// Helpers
export const bySlug = Object.fromEntries(CALCULATORS.map(c => [c.slug, c]));
export const byId = Object.fromEntries(CALCULATORS.map(c => [c.id, c]));
