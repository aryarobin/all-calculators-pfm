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
  {
    id: 'fire',
    label: 'Financial Freedom (FIRE)',
    high: ['fire number', 'financial independence', 'retire today', 'retire now', 'live off interest', 'live off returns', 'fi number', 'never work again', 'work optional'],
    med: ['financial freedom', 'passive income forever', 'enough to never work', '25x expenses', '4 percent rule', 'safe withdrawal'],
    low: ['freedom', 'independent', 'forever'],
    response: 'Financial Freedom (FIRE) — how much you need to retire today and live off returns forever.',
  },
  {
    id: 'coast',
    label: 'Coast FIRE',
    high: ['coast fire', 'coast fi', 'stop investing', 'stop sip', 'when can i stop', 'enough already invested', 'let it compound'],
    med: ['coast', 'stop saving', 'no more investing', 'on autopilot'],
    low: ['coast', 'enough saved'],
    response: 'Coast FIRE — the corpus where compounding alone reaches your retirement number.',
  },
  {
    id: 'crorepati',
    label: 'Crorepati Timeline',
    high: ['crorepati', '1 crore', 'first crore', 'reach 1 cr', '5 crore', '10 crore', 'become rich', 'when will i be a crorepati', 'how to become crorepati'],
    med: ['crore', 'rich', 'wealthy', 'when 1 cr', 'sip for crore'],
    low: ['crore', 'rich'],
    response: 'Crorepati Timeline — exactly when your SIP makes you a crorepati, or the SIP to get there.',
  },
  {
    id: 'rentbuy',
    label: 'Rent vs Buy',
    high: ['rent vs buy', 'rent or buy', 'should i buy a house', 'should i buy a flat', 'buy or rent home', 'renting vs buying'],
    med: ['rent or own', 'keep renting', 'worth buying', 'home ownership'],
    low: ['rent', 'buy home'],
    response: 'Rent vs Buy — compare net worth from buying a home vs renting and investing the difference.',
  },
  {
    id: 'prepay',
    label: 'Prepay vs Invest',
    high: ['prepay loan', 'prepay home loan', 'foreclose loan', 'pay off loan early', 'prepay or invest', 'close loan or invest', 'should i prepay'],
    med: ['prepay', 'extra emi', 'part payment', 'reduce loan', 'clear loan faster'],
    low: ['prepay', 'pay early'],
    response: 'Prepay vs Invest — should you prepay your home loan or invest the surplus?',
  },
  {
    id: 'xirr',
    label: 'XIRR Calculator',
    high: ['xirr', 'actual return on sip', 'real return on sip', 'irregular cashflow return', 'portfolio xirr', 'my actual returns'],
    med: ['annualised sip return', 'return with dates', 'true return', 'irr'],
    low: ['actual return', 'real return'],
    response: 'XIRR Calculator — your true annualised return accounting for the timing of every cashflow.',
  },
  {
    id: 'capgains',
    label: 'Capital Gains Tax',
    high: ['capital gains', 'ltcg', 'stcg', 'tax on shares', 'tax on mutual fund', 'tax on selling', 'tax on property sale', 'tax on gold sale', 'indexation'],
    med: ['long term capital gain', 'short term capital gain', 'tax on profit', 'tax when i sell'],
    low: ['gains tax', 'selling tax'],
    response: 'Capital Gains Tax — LTCG and STCG on equity, debt, property and gold under current rules.',
  },
  {
    id: 'creditcard',
    label: 'Credit Card Payoff',
    high: ['credit card debt', 'credit card payoff', 'card outstanding', 'minimum payment trap', 'clear credit card', 'credit card interest'],
    med: ['card debt', 'card bill', 'revolving credit', 'card emi'],
    low: ['credit card', 'card'],
    response: 'Credit Card Payoff — how long to clear your card debt and the brutal interest at 36–48% APR.',
  },
  {
    id: 'networth',
    label: 'Net Worth Tracker',
    high: ['net worth', 'networth', 'total wealth', 'assets minus liabilities', 'how rich am i', 'my net worth'],
    med: ['total assets', 'what am i worth', 'wealth statement'],
    low: ['worth', 'assets'],
    response: 'Net Worth Tracker — total assets minus liabilities, with your asset allocation.',
  },
  {
    id: 'emergency',
    label: 'Emergency Fund',
    high: ['emergency fund', 'contingency fund', 'rainy day fund', 'months of expenses', 'emergency savings', 'job loss fund'],
    med: ['emergency', 'buffer', 'safety net', 'how much cash to keep'],
    low: ['emergency', 'buffer'],
    response: 'Emergency Fund — how many months of expenses you should keep and how to build it.',
  },
  {
    id: 'gold',
    label: 'Gold: SGB vs ETF vs Physical',
    high: ['sgb', 'sovereign gold bond', 'gold etf', 'physical gold', 'gold investment', 'invest in gold', 'digital gold', 'gold vs', 'best way to buy gold'],
    med: ['gold', 'jewellery investment', 'gold returns', 'gold bond'],
    low: ['gold'],
    response: 'Gold Calculator — SGB vs Gold ETF vs physical gold after interest, charges and tax.',
  },
  {
    id: 'healthcover',
    label: 'Health Cover Needed',
    high: ['health insurance', 'mediclaim', 'health cover', 'medical insurance', 'family floater', 'how much health cover', 'super top up'],
    med: ['hospital cover', 'medical cover', 'health policy', 'insurance for family'],
    low: ['health', 'medical'],
    response: 'Health Cover Needed — how much health insurance your family should carry, by city and age.',
  },
  {
    id: 'termcover',
    label: 'Term Cover Needed',
    high: ['term insurance', 'term cover', 'life insurance cover', 'how much life cover', 'life insurance amount', 'sum assured', 'human life value'],
    med: ['term plan', 'life cover', 'death benefit', 'protect family'],
    low: ['insurance', 'cover'],
    response: 'Term Cover Needed — the life cover your family actually needs, from income, loans and goals.',
  },
  {
    id: 'insurevsinvest',
    label: 'Insurance vs Investment',
    high: ['ulip', 'lic policy', 'endowment', 'money back policy', 'insurance vs investment', 'should i buy ulip', 'surrender lic', 'buy term invest rest'],
    med: ['traditional policy', 'investment insurance', 'guaranteed return policy', 'bima'],
    low: ['policy', 'ulip'],
    response: 'Insurance vs Investment — term + invest the difference vs a ULIP or LIC endowment.',
  },
  {
    id: 'epfnpsvpf',
    label: 'EPF vs NPS vs VPF',
    high: ['epf vs nps', 'vpf', 'voluntary provident fund', 'epf or nps', 'nps vs epf', 'provident fund vs nps', 'best retirement scheme'],
    med: ['epf', 'employee provident fund', 'pf', 'nps return', '80ccd'],
    low: ['provident', 'pension scheme'],
    response: 'EPF vs NPS vs VPF — guaranteed tax-free returns vs market-linked, after tax and the 80CCD break.',
  },
  {
    id: 'directregular',
    label: 'Direct vs Regular MF',
    high: ['direct vs regular', 'direct mutual fund', 'regular plan', 'expense ratio', 'trail commission', 'switch to direct'],
    med: ['direct plan', 'commission cost', 'distributor commission'],
    low: ['direct', 'regular'],
    response: 'Direct vs Regular MF — how the regular-plan commission silently costs you lakhs.',
  },
  {
    id: 'lumpvssip',
    label: 'Lumpsum vs SIP (STP)',
    high: ['lumpsum vs sip', 'stp', 'systematic transfer', 'invest windfall', 'all at once or sip', 'deploy bonus', 'invest bonus'],
    med: ['stagger investment', 'one shot or monthly', 'spread investment'],
    low: ['windfall', 'all at once'],
    response: 'Lumpsum vs SIP — invest a windfall all at once or stagger it via STP, with the timing trade-off.',
  },
  {
    id: 'costofdelay',
    label: 'Cost of Delay',
    high: ['cost of delay', 'delay investing', 'start late', 'procrastinate investing', 'waiting to invest', 'should i start now', 'price of waiting'],
    med: ['start early', 'start now', 'delay sip', 'late start'],
    low: ['delay', 'wait'],
    response: 'Cost of Delay — exactly what waiting a few years to start your SIP costs your final corpus.',
  },
  {
    id: 'realreturn',
    label: 'Real Return',
    high: ['real return', 'return after tax and inflation', 'inflation adjusted return', 'post tax return', 'actual return after inflation', 'real rate of return'],
    med: ['after tax return', 'after inflation', 'true return', 'net return'],
    low: ['real', 'after tax'],
    response: 'Real Return — what you actually keep after tax and inflation erode the headline number.',
  },
  {
    id: 'brokerage',
    label: 'Brokerage & Charges',
    high: ['brokerage', 'trading charges', 'stt', 'demat charges', 'dp charges', 'trading cost', 'cost of trading', 'broker fees'],
    med: ['charges', 'transaction cost', 'intraday cost', 'delivery charges'],
    low: ['trading', 'broker'],
    response: 'Brokerage & Charges — the true per-trade and yearly cost of trading, and its drag on returns.',
  },
  {
    id: 'jobswitch',
    label: 'Job Switch / Hike Worth It?',
    high: ['job switch', 'new job offer', 'change job', 'is the hike worth it', 'salary hike worth', 'relocate for job', 'should i switch jobs', 'cost of living'],
    med: ['new offer', 'job change', 'relocation', 'real raise', 'switch worth it'],
    low: ['switch', 'new job'],
    response: 'Job Switch Calculator — is the new offer a real raise after cost-of-living differences?',
  },
  {
    id: 'postoffice',
    label: 'Post Office Schemes',
    high: ['nsc', 'kvp', 'kisan vikas patra', 'scss', 'senior citizen savings', 'post office scheme', 'pomis', 'monthly income scheme', 'national savings certificate'],
    med: ['small savings', 'post office', 'government scheme', 'sovereign safe'],
    low: ['post office', 'certificate'],
    response: 'Post Office Schemes — maturity for NSC, KVP, SCSS and Monthly Income Scheme.',
  },
  {
    id: 'ssy',
    label: 'Sukanya Samriddhi',
    high: ['sukanya', 'sukanya samriddhi', 'ssy', 'daughter savings', 'girl child scheme', 'save for daughter'],
    med: ['daughter', 'girl child', 'beti'],
    low: ['daughter'],
    response: 'Sukanya Samriddhi — tax-free corpus for your daughter at 8.2%.',
  },
  {
    id: 'simplecompound',
    label: 'Simple vs Compound',
    high: ['simple vs compound', 'simple interest', 'compound interest', 'power of compounding', 'compounding effect'],
    med: ['compounding', 'interest difference', 'how compounding works'],
    low: ['interest', 'compound'],
    response: 'Simple vs Compound — see why compounding quietly builds wealth over simple interest.',
  },
  {
    id: 'indexactive',
    label: 'Index vs Active Fund',
    high: ['index vs active', 'index fund vs active', 'active vs passive', 'passive investing', 'index fund', 'nifty index fund', 'beat the index', 'expense ratio active'],
    med: ['index fund return', 'active fund', 'passive fund', 'should i buy index', 'etf vs active'],
    low: ['index', 'passive', 'active fund'],
    response: 'Index vs Active — the extra return an active fund must earn just to beat a cheap index fund.',
  },
  {
    id: 'growthidcw',
    label: 'Growth vs IDCW (Dividend)',
    high: ['growth vs idcw', 'growth or dividend', 'idcw', 'dividend option', 'growth option', 'dividend vs growth mutual fund', 'reinvestment vs payout'],
    med: ['dividend mutual fund', 'mutual fund dividend', 'payout option', 'which option mutual fund'],
    low: ['idcw', 'dividend', 'growth option'],
    response: 'Growth vs IDCW — which mutual fund option wins after tax (growth almost always does).',
  },
  {
    id: 'debtvsfd',
    label: 'Debt Fund vs FD',
    high: ['debt fund vs fd', 'debt mutual fund vs fd', 'debt fund or fd', 'liquid fund vs fd', 'debt fund tax', 'is debt fund better than fd', 'arbitrage fund vs fd'],
    med: ['debt fund', 'debt mutual fund', 'fd alternative', 'better than fd', 'park money'],
    low: ['debt fund', 'liquid fund'],
    response: 'Debt Fund vs FD — are debt mutual funds still better than FDs after the 2023 tax change?',
  },
  {
    id: 'elss',
    label: 'ELSS Tax-Saver',
    high: ['elss', 'tax saver fund', 'tax saving mutual fund', 'elss calculator', '80c mutual fund', 'tax saver sip', 'equity linked savings'],
    med: ['save tax mutual fund', 'tax saving sip', '3 year lock in', 'tax saver'],
    low: ['80c', 'tax saver', 'elss'],
    response: 'ELSS Tax-Saver — equity returns plus 80C tax savings with just a 3-year lock-in.',
  },
  {
    id: 'ltcgharvest',
    label: 'LTCG Tax Harvesting',
    high: ['tax harvesting', 'ltcg harvesting', 'tax loss harvesting', 'book gains', 'reset cost basis', '1.25 lakh exemption', 'harvest gains'],
    med: ['save ltcg', 'reduce capital gains tax', 'use exemption', 'rebuy units'],
    low: ['harvest', 'exemption'],
    response: 'LTCG Harvesting — book ₹1.25L of gains tax-free each year to cut tax at redemption.',
  },
  {
    id: 'assetalloc',
    label: 'Asset Allocation & Rebalancing',
    high: ['asset allocation', 'equity debt split', 'rebalancing', 'rebalance portfolio', 'equity vs debt ratio', '100 minus age', 'portfolio allocation'],
    med: ['allocation by age', 'how much equity', 'how much debt', 'portfolio mix', 'glide path'],
    low: ['allocation', 'rebalance', 'mix'],
    response: 'Asset Allocation — your ideal equity-debt split by age, drift, and how much to rebalance.',
  },
  {
    id: 'siplumpsum',
    label: 'SIP + Lumpsum Combo',
    high: ['sip plus lumpsum', 'sip and lumpsum', 'lumpsum and sip together', 'combined sip lumpsum', 'one time plus monthly'],
    med: ['lumpsum with sip', 'initial investment plus sip', 'sip with initial amount'],
    low: ['combine', 'together'],
    response: 'SIP + Lumpsum — project a one-time amount and a monthly SIP together.',
  },
  {
    id: 'loaneligibility',
    label: 'Home Loan Eligibility',
    high: ['loan eligibility', 'home loan eligibility', 'how much loan can i get', 'how much home loan', 'loan amount on salary', 'foir', 'loan i qualify for'],
    med: ['eligible loan', 'borrow how much', 'loan on my income', 'afford home loan'],
    low: ['eligibility', 'qualify'],
    response: 'Home Loan Eligibility — the loan you qualify for on your income, and the property you can afford.',
  },
  {
    id: 'prepayimpact',
    label: 'Loan Prepayment Impact',
    high: ['prepayment calculator', 'loan prepayment', 'part payment', 'prepay calculator', 'interest saved prepaying', 'pay loan early', 'foreclose'],
    med: ['extra emi', 'reduce tenure', 'prepay home loan', 'close loan early'],
    low: ['prepay', 'part pay'],
    response: 'Loan Prepayment — the interest you save and months you cut by prepaying.',
  },
  {
    id: 'balancetransfer',
    label: 'Balance Transfer / Refinance',
    high: ['balance transfer', 'home loan transfer', 'refinance', 'switch home loan', 'transfer loan lower rate', 'loan refinance'],
    med: ['lower interest rate loan', 'change lender', 'reduce loan rate'],
    low: ['transfer', 'refinance'],
    response: 'Balance Transfer — net savings from moving your loan to a lower rate, after fees.',
  },
  {
    id: 'nps',
    label: 'NPS Calculator',
    high: ['nps', 'national pension', 'nps calculator', 'nps pension', 'nps corpus', 'nps maturity', 'annuity pension'],
    med: ['pension scheme', 'tier 1 nps', '80ccd', 'monthly pension'],
    low: ['pension', 'annuity'],
    response: 'NPS Calculator — your corpus, tax-free lumpsum and monthly pension at 60.',
  },
  {
    id: 'epf',
    label: 'EPF Calculator',
    high: ['epf', 'pf calculator', 'provident fund', 'employee provident fund', 'epf corpus', 'epf maturity', 'pf balance at retirement'],
    med: ['pf corpus', 'pf interest', '12 percent pf', 'pf at retirement'],
    low: ['pf', 'provident'],
    response: 'EPF Calculator — your provident fund corpus at retirement, tax-free.',
  },
  {
    id: 'education',
    label: 'Child Education Planner',
    high: ['child education', 'education planning', 'college fund', 'education cost', 'save for college', 'child education calculator', 'education inflation'],
    med: ['child future', 'kids education', 'degree cost', 'school fees future'],
    low: ['education', 'college'],
    response: 'Child Education Planner — the future cost and the SIP needed to fund it.',
  },
  {
    id: 'freelancetax',
    label: 'Freelancer Tax (44ADA)',
    high: ['freelancer tax', '44ada', 'presumptive tax', 'consultant tax', 'professional tax 44ada', 'self employed tax', 'gig tax'],
    med: ['freelance income tax', 'contractor tax', 'business tax presumptive', '44ad'],
    low: ['freelance', 'consultant'],
    response: 'Freelancer Tax — presumptive taxation under 44ADA, declare 50% of receipts.',
  },
  {
    id: 'gratuity',
    label: 'Gratuity Calculator',
    high: ['gratuity', 'gratuity calculator', 'gratuity amount', 'gratuity on resignation', 'gratuity tax', 'payment of gratuity'],
    med: ['exit benefit', 'service payout', 'years of service payment'],
    low: ['gratuity'],
    response: 'Gratuity Calculator — your payout from last salary and years of service, and the tax-free limit.',
  },
  {
    id: 'hra',
    label: 'HRA Exemption',
    high: ['hra', 'hra exemption', 'house rent allowance', 'hra calculation', 'rent allowance tax', 'hra tax free'],
    med: ['rent exemption', 'claim hra', 'hra deduction'],
    low: ['hra', 'rent allowance'],
    response: 'HRA Exemption — how much of your house rent allowance is tax-free.',
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
