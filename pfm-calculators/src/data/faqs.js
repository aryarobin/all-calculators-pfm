// Per-calculator FAQ content — powers BOTH the on-page FAQ block (trust + dwell
// time) and the FAQPage JSON-LD emitted at prerender (rich results on Google).
// Plain data so it imports cleanly in the browser and in the Node build script.
// Calculators without an entry simply render no FAQ block (graceful).

export const FAQS = {
  sip: [
    { q: 'How is SIP return calculated?', a: 'A SIP invests a fixed amount monthly. Each instalment compounds at the expected annual return for the time it stays invested. The calculator sums the future value of every instalment using the standard SIP future-value formula.' },
    { q: 'What is a realistic return to assume for an equity SIP?', a: 'Indian equity mutual funds have historically delivered roughly 11–13% over long periods, but returns are not guaranteed and vary year to year. Use 10–12% for a conservative long-term estimate and never assume short-term returns.' },
    { q: 'Is SIP better than a lumpsum investment?', a: 'SIP averages your purchase cost and removes timing risk, which suits regular income earners. A lumpsum can do better in a rising market if invested early. For most salaried investors, a disciplined SIP is the simpler, lower-stress choice.' },
    { q: 'Are SIP returns taxed?', a: 'Yes. Equity fund gains held over a year are taxed at 12.5% LTCG above ₹1.25 lakh per year; under a year they are 20% STCG. Each SIP instalment has its own holding period for tax.' },
  ],
  lumpsum: [
    { q: 'How does a lumpsum investment grow?', a: 'A one-time amount compounds at the expected annual return for the full period. The calculator applies compound growth: final value = amount × (1 + return)^years.' },
    { q: 'When does a lumpsum double?', a: 'Use the Rule of 72: divide 72 by your return rate. At 12% your money roughly doubles every 6 years; at 8%, every 9 years.' },
    { q: 'Should I invest a lumpsum all at once or stagger it?', a: 'Over long horizons, investing all at once usually wins because markets rise more often than they fall. If a large sum makes you nervous, an STP over 6–12 months reduces timing regret. See our Lumpsum vs SIP calculator.' },
  ],
  retirement: [
    { q: 'How much corpus do I need to retire in India?', a: 'It depends on your monthly expenses, inflation, and how long retirement lasts. A common benchmark is 25–30× your annual expenses at retirement, adjusted for inflation. This calculator works out the exact corpus and the SIP to reach it.' },
    { q: 'What inflation rate should I use for retirement planning?', a: 'India\'s long-term inflation is around 6%. Lifestyle and medical inflation can run higher, so 6–7% is prudent for retirement projections.' },
    { q: 'How much should I invest monthly for retirement?', a: 'The calculator reverses the maths: it takes your target corpus and shows the monthly SIP needed at your expected return. Starting earlier dramatically lowers the required amount thanks to compounding.' },
  ],
  goal: [
    { q: 'How do I calculate the SIP needed for a goal?', a: 'First inflate the goal\'s cost to its future value, then work out the monthly SIP that grows to that amount at your expected return. This calculator does both, accounting for any savings you already have.' },
    { q: 'Should goal amounts be adjusted for inflation?', a: 'Yes. A goal that costs ₹10 lakh today may cost far more in 10 years. Always plan against the inflation-adjusted future cost, which this tool computes automatically.' },
  ],
  emi: [
    { q: 'How is EMI calculated?', a: 'EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is principal, r the monthly interest rate, and n the number of months. The calculator also shows total interest and a full amortisation schedule.' },
    { q: 'Does a longer tenure reduce my EMI?', a: 'Yes, a longer tenure lowers the monthly EMI but significantly increases the total interest you pay over the life of the loan. Shorter tenures cost more monthly but far less overall.' },
    { q: 'How can I reduce my home loan interest?', a: 'Prepay whenever you have surplus, especially in the early years when interest is highest, or increase your EMI with salary growth. See our Prepay vs Invest calculator to decide where surplus is best deployed.' },
  ],
  tax: [
    { q: 'Which is better — the new or old tax regime?', a: 'The new regime has lower rates but removes most deductions; the old regime rewards those who claim 80C, 80D, HRA and home-loan interest. This calculator compares both on your numbers and shows which saves more.' },
    { q: 'What is the income tax rebate under section 87A?', a: 'Under the new regime, a rebate makes income up to ₹7 lakh effectively tax-free; under the old regime the threshold is ₹5 lakh. The calculator applies the rebate automatically.' },
    { q: 'What is the standard deduction for salaried individuals?', a: 'Salaried taxpayers get a standard deduction of ₹75,000 in the new regime and ₹50,000 in the old regime, applied before tax is calculated.' },
  ],
  fdppf: [
    { q: 'Is PPF interest tax-free?', a: 'Yes. PPF enjoys EEE status — contributions qualify for 80C, and both the interest and the maturity amount are fully tax-free. The current rate is around 7.1%.' },
    { q: 'How is FD interest taxed?', a: 'FD interest is added to your income and taxed at your slab rate every year, with TDS if it crosses the threshold. This makes FDs less tax-efficient than PPF or debt funds for higher tax brackets.' },
    { q: 'Which is better — FD, PPF or NPS?', a: 'PPF suits tax-free long-term safety, FD suits short-term certainty, and NPS suits retirement with higher (market-linked) returns. This calculator shows maturity for each so you can compare.' },
  ],
  xirr: [
    { q: 'What is XIRR and why does it matter?', a: 'XIRR is the true annualised return when money goes in and out on different dates — exactly how SIPs work. Unlike simple average return, it accounts for the timing of every cashflow.' },
    { q: 'How is XIRR different from CAGR?', a: 'CAGR assumes a single investment and single redemption. XIRR handles multiple, irregular cashflows, so it is the correct measure for SIPs and staggered investments.' },
  ],
  cagr: [
    { q: 'What is CAGR?', a: 'CAGR (Compound Annual Growth Rate) is the smoothed annual rate at which an investment grew from its start to end value: CAGR = (End/Start)^(1/years) − 1.' },
    { q: 'Is a higher CAGR always better?', a: 'A higher CAGR means faster growth, but always check the risk taken and the time period. Short-period CAGRs can be misleading; compare over similar, long horizons.' },
  ],
  stepup: [
    { q: 'What is a step-up SIP?', a: 'A step-up (or top-up) SIP increases your monthly investment by a fixed percentage every year — usually in line with your salary hike. It dramatically boosts the final corpus versus a flat SIP.' },
    { q: 'How much does stepping up a SIP help?', a: 'Even a 10% annual step-up can grow your final corpus by 40–60% over 20 years compared with a constant SIP, because each year\'s higher contribution compounds for longer.' },
  ],
  swp: [
    { q: 'What is an SWP (Systematic Withdrawal Plan)?', a: 'An SWP lets you withdraw a fixed amount from a mutual fund corpus at regular intervals, while the remaining money stays invested and keeps growing. It is a tax-efficient way to draw retirement income.' },
    { q: 'How long will my corpus last with an SWP?', a: 'It depends on the withdrawal amount, the return earned, and inflation. If withdrawals exceed growth, the corpus depletes; this calculator shows exactly how long it sustains.' },
  ],
  crorepati: [
    { q: 'How much SIP do I need to become a crorepati?', a: 'At 12% annual return, roughly ₹10,000/month for about 20 years, or ₹21,000/month for about 15 years, reaches ₹1 crore. This calculator shows the exact SIP for your timeline.' },
    { q: 'How long does it take to reach ₹1 crore?', a: 'It depends on your monthly investment and return. The calculator computes the precise number of years to hit ₹1, ₹5 or ₹10 crore for your SIP.' },
  ],
  indexactive: [
    { q: 'Are index funds better than active funds in India?', a: 'Over 10+ years, most large-cap active funds in India have failed to beat their benchmark after fees. Index funds offer market returns at very low cost, making them a strong default for core equity.' },
    { q: 'How much must an active fund outperform to be worth it?', a: 'At least by the difference in expense ratios — often around 1% a year, every year, just to break even with an index fund. This calculator shows that hurdle and when active wins.' },
  ],
  growthidcw: [
    { q: 'Growth or IDCW (dividend) option — which is better?', a: 'For wealth-building, the Growth option almost always wins. It defers tax to a single 12.5% LTCG at redemption, while IDCW payouts are taxed at your slab rate every year, leaking returns that could have compounded.' },
    { q: 'What replaced the dividend option in mutual funds?', a: 'It was renamed IDCW (Income Distribution cum Capital Withdrawal) to clarify that payouts partly return your own capital. The tax treatment is at your income slab.' },
  ],
  debtvsfd: [
    { q: 'Are debt mutual funds still better than FDs after 2023?', a: 'Both are now taxed at your slab, but debt funds defer tax until you redeem, so more money compounds along the way. They are also more liquid than locked FDs, so they often still win for 1–5 year horizons.' },
    { q: 'When is an FD better than a debt fund?', a: 'Choose an FD for absolute capital certainty, deposit insurance up to ₹5 lakh, or if you are in the 0% tax bracket where the deferral advantage disappears.' },
  ],
  elss: [
    { q: 'What is ELSS and how does it save tax?', a: 'ELSS are equity mutual funds eligible for 80C deduction up to ₹1.5 lakh a year. They offer equity returns with the shortest lock-in of any 80C option — just 3 years.' },
    { q: 'Does ELSS help under the new tax regime?', a: 'No. 80C deductions, including ELSS, only apply under the old tax regime. Under the new regime there is no tax benefit, though the fund still works as an equity investment.' },
  ],
  directregular: [
    { q: 'What is the difference between direct and regular mutual funds?', a: 'Direct plans have no distributor commission, so their expense ratio is lower — typically by 0.5–1%. Regular plans pay a trail commission baked into a higher expense ratio. Same fund, same manager.' },
    { q: 'How much do regular plans cost over time?', a: 'A 1% higher expense ratio can cost several lakhs over 15–20 years on a meaningful SIP, because the extra fee compounds against you every year. This calculator shows the exact amount.' },
  ],
  inflation: [
    { q: 'How does inflation affect my savings?', a: 'Inflation erodes purchasing power — money sitting idle buys less each year. At 6% inflation, prices roughly double every 12 years, so investments must out-earn inflation to build real wealth.' },
    { q: 'What is real return?', a: 'Real return is your return after subtracting inflation. A 7% FD with 6% inflation gives only about 1% real growth before tax — see our Real Return calculator for the after-tax-and-inflation figure.' },
  ],
  fire: [
    { q: 'What is the FIRE number?', a: 'Your FIRE (Financial Independence, Retire Early) number is the corpus that lets you live off withdrawals indefinitely — typically 25–33× your annual expenses, depending on the safe withdrawal rate you assume.' },
    { q: 'What is a safe withdrawal rate for India?', a: 'Because Indian inflation is higher, a more conservative 3–3.5% withdrawal rate is often suggested versus the classic 4% rule used in the US.' },
  ],
  rentbuy: [
    { q: 'Is it better to rent or buy a house in India?', a: 'It depends on price-to-rent ratio, how long you stay, home appreciation, and what you could earn investing the difference. Buying builds equity but ties up capital; renting plus investing can build comparable wealth with more flexibility.' },
    { q: 'How many years make buying worthwhile?', a: 'Because of high transaction and interest costs, buying usually beats renting only if you stay long enough — often 7–10+ years. This calculator compares net worth on both paths for your inputs.' },
  ],
  prepay: [
    { q: 'Should I prepay my home loan or invest?', a: 'Compare your loan rate with your expected post-tax investment return. If investments reliably earn more than the loan costs, investing builds more wealth; otherwise prepaying is the guaranteed, risk-free win.' },
    { q: 'When is prepaying a loan best?', a: 'Prepaying early in the tenure saves the most interest, and it always beats investing when your loan rate exceeds your realistic post-tax return. It also reduces risk and stress.' },
  ],
  capgains: [
    { q: 'What is the LTCG tax on equity in India?', a: 'Long-term capital gains on listed equity and equity mutual funds (held over 1 year) are taxed at 12.5%, with the first ₹1.25 lakh of gains each year exempt.' },
    { q: 'How are short-term equity gains taxed?', a: 'Short-term capital gains on equity held under a year are taxed at 20% under current rules.' },
  ],
  salary: [
    { q: 'How is in-hand salary different from CTC?', a: 'CTC includes employer contributions (PF, gratuity, insurance) and benefits you never receive in cash. In-hand salary is what reaches your bank after PF, professional tax and income tax. This calculator breaks it down.' },
    { q: 'How is HRA exemption calculated?', a: 'HRA exemption is the least of: actual HRA received, rent paid minus 10% of basic, and 50% of basic (metro) or 40% (non-metro). The calculator computes it for you.' },
  ],
  multiplier: [
    { q: 'How long will it take to double my money?', a: 'Divide 72 by your return rate (Rule of 72). At 12%, money doubles in about 6 years; at 15%, in about 4.8 years. The calculator also shows 5× and 10× timelines.' },
    { q: 'What return do I need to 10× my money?', a: 'It depends on time: 10× in 20 years needs about 12.2% a year, while 10× in 30 years needs only about 8% a year. Compounding time matters more than chasing high returns.' },
  ],
};

// One-line plain-language intro per calculator for the crawlable block.
export const INTROS = {
  sip: 'A SIP (Systematic Investment Plan) lets you invest a fixed amount in mutual funds every month. This calculator shows how those instalments compound into a corpus over time.',
  indexactive: 'Index funds track the market cheaply; active funds charge more to try to beat it. This calculator shows the fee hurdle an active fund must clear to be worth it.',
  growthidcw: 'Mutual funds offer Growth and IDCW (dividend) options. This calculator shows which leaves you richer after tax.',
  debtvsfd: 'Since 2023, debt funds and FDs are both taxed at your slab — but they differ in when tax is charged. This calculator compares them after tax.',
  elss: 'ELSS funds combine equity returns with an 80C tax deduction and the shortest lock-in of any tax-saving option. This calculator shows corpus plus tax saved.',
};
