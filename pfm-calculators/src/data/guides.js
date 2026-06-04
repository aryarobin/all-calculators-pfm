// SEO "learn" guides — long-form content targeting fat keywords, with internal
// links to the relevant calculators. Powers the /learn pages (client render) and
// the prerendered HTML + Article/FAQ JSON-LD. Plain data; imports in browser + Node.

export const GUIDES = [
  {
    slug: 'how-much-sip-for-1-crore',
    title: 'How Much SIP Do You Need to Reach ₹1 Crore? | GoalFi',
    description: 'The exact monthly SIP to reach ₹1 crore at different returns and timeframes — and how starting early changes everything. With a free calculator.',
    h1: 'How much SIP do you need to reach ₹1 crore?',
    intro: 'Reaching ₹1 crore through a SIP is far more achievable than most people think — the key variables are how much you invest, for how long, and the return you earn. Here is what it actually takes.',
    sections: [
      { heading: 'The short answer', body: [
        'At a 12% annual return, you need roughly ₹10,000 a month for 20 years, ₹21,000 a month for 15 years, or about ₹43,000 a month for 10 years to reach ₹1 crore. The longer your money compounds, the less you have to invest each month.',
        'This is the power of compounding: in a 20-year SIP, a large share of your final corpus is growth, not the money you put in. Time does the heavy lifting.',
      ] },
      { heading: 'Why starting early matters most', body: [
        'A 25-year-old investing ₹10,000/month reaches ₹1 crore by 45. Someone starting the same SIP at 35 needs nearly ₹21,000/month to get there by the same age — more than double. Every year you delay raises the monthly amount sharply, because you lose your most valuable compounding years.',
        'If you can\'t invest the full amount today, start with what you can and step it up each year as your income grows — even a 10% annual increase dramatically shortens the journey.',
      ] },
      { heading: 'Be realistic about returns', body: [
        'Indian equity funds have historically returned 11–13% over long periods, but returns are never guaranteed and vary year to year. Plan with 10–12% for equity, and remember that gains above ₹1.25 lakh a year are taxed at 12.5% LTCG when you redeem.',
      ] },
    ],
    calcs: ['crorepati', 'sip', 'stepup'],
    faqs: [
      { q: 'How much SIP for 1 crore in 15 years?', a: 'At a 12% annual return, about ₹21,000 per month for 15 years reaches ₹1 crore. At 10% it is closer to ₹24,000, and at 14% about ₹18,000.' },
      { q: 'Can I reach 1 crore with a ₹5,000 SIP?', a: 'Yes, with enough time. A ₹5,000 monthly SIP at 12% reaches ₹1 crore in about 26 years. Stepping it up each year gets you there considerably faster.' },
    ],
  },
  {
    slug: 'nps-vs-ppf-vs-epf',
    title: 'NPS vs PPF vs EPF — Which Is Best for Retirement? | GoalFi',
    description: 'Compare NPS, PPF and EPF for retirement — returns, tax treatment, lock-in and flexibility — so you know where to put your long-term money.',
    h1: 'NPS vs PPF vs EPF: which is best for retirement?',
    intro: 'These three are the backbone of most Indians\' retirement savings, but they work very differently on returns, tax and access. Here is how to choose.',
    sections: [
      { heading: 'The quick comparison', body: [
        'EPF and PPF are guaranteed and fully tax-free (EEE) — EPF earns around 8.25% and PPF around 7.1%. NPS is market-linked, so it can earn more over the long run (often 9–11% with equity exposure), but 40% of the corpus must buy an annuity at 60, and that pension is taxable.',
        'PPF is the most flexible for a small saver: anyone can open one, contributions qualify for 80C, and the 15-year lock-in can be extended. EPF is automatic for salaried employees and can be topped up via VPF at the same guaranteed rate.',
      ] },
      { heading: 'How to choose', body: [
        'If you want guaranteed, tax-free returns with no market risk, EPF (plus VPF) and PPF are excellent. If you want higher growth potential and the extra ₹50,000 deduction under 80CCD(1B), add NPS — but treat its annuity requirement and lock-in to 60 as the trade-off.',
        'Many investors use a blend: mandatory EPF, PPF or VPF for guaranteed tax-free growth, ₹50,000 in NPS purely for the extra tax break, and equity mutual funds for the flexible, higher-growth portion of retirement.',
      ] },
    ],
    calcs: ['epfnpsvpf', 'nps', 'epf', 'fdppf'],
    faqs: [
      { q: 'Is NPS better than PPF?', a: 'NPS can earn more over the long term because it invests in equity, but it locks money to 60 and forces 40% into a taxable annuity. PPF is lower-return but fully tax-free and more flexible. Many people use both.' },
      { q: 'Can I invest in EPF, PPF and NPS together?', a: 'Yes. EPF is automatic if salaried, PPF is open to everyone, and NPS can be added on top — its ₹50,000 80CCD(1B) deduction is over and above the ₹1.5 lakh 80C limit.' },
    ],
  },
  {
    slug: 'new-vs-old-tax-regime',
    title: 'New vs Old Tax Regime — Which Should You Pick? | GoalFi',
    description: 'Understand the new vs old income tax regime in India — who benefits from each, the breakeven on deductions, and how to decide. With a free calculator.',
    h1: 'New vs old tax regime: which should you choose?',
    intro: 'The new regime has lower slab rates but removes almost all deductions; the old regime rewards those who claim them. The right choice depends entirely on how much you deduct.',
    sections: [
      { heading: 'How they differ', body: [
        'The new regime is now the default. It has wider, lower slabs and a higher ₹75,000 standard deduction, but no 80C, 80D, HRA or home-loan-interest benefits. The old regime has higher rates but lets you reduce taxable income through those deductions.',
        'Under the new regime, income up to ₹7 lakh is effectively tax-free via the 87A rebate; under the old regime that threshold is ₹5 lakh.',
      ] },
      { heading: 'The rule of thumb', body: [
        'The more deductions you genuinely claim — full 80C, health insurance under 80D, significant HRA, home-loan interest — the more likely the old regime wins. If you claim few or no deductions, the new regime\'s lower rates usually leave you better off.',
        'Don\'t guess: run your actual numbers. The break-even shifts with income level and exactly which deductions apply to you.',
      ] },
    ],
    calcs: ['tax', 'hra', 'salary'],
    faqs: [
      { q: 'Is the new tax regime better?', a: 'It is better for people who claim few deductions, thanks to lower slab rates and a higher standard deduction. If you fully use 80C, 80D, HRA and home-loan interest, the old regime often saves more.' },
      { q: 'Can I switch between regimes?', a: 'Salaried individuals can choose each year. Those with business income face more restrictions on switching back. Compare both every year as your deductions change.' },
    ],
  },
  {
    slug: 'how-much-to-retire-in-india',
    title: 'How Much Do You Need to Retire in India? | GoalFi',
    description: 'Work out the retirement corpus you need in India based on expenses, inflation and longevity — and the monthly SIP to get there. With a free calculator.',
    h1: 'How much do you need to retire in India?',
    intro: 'Your retirement number depends on your expenses, inflation, and how long retirement lasts. Here is how to estimate it without guesswork.',
    sections: [
      { heading: 'Start with your expenses, not a round number', body: [
        'A common benchmark is 25–30 times your annual expenses at retirement. The catch is "at retirement" — today\'s ₹50,000/month becomes far more after decades of inflation, so you must inflate your current spending forward first.',
        'At 6% inflation, monthly expenses roughly double every 12 years. A ₹60,000/month lifestyle today could need around ₹1.7 lakh/month in 18 years — and your corpus has to sustain that, rising, for 25–30 years of retirement.',
      ] },
      { heading: 'Why the safe withdrawal rate is lower in India', body: [
        'The classic "4% rule" comes from US data. Because Indian inflation is structurally higher, a more conservative 3–3.5% withdrawal rate is often suggested, which means you need a slightly larger corpus to be safe.',
      ] },
      { heading: 'Turn the number into a monthly SIP', body: [
        'Once you know the corpus, the question becomes how much to invest monthly to reach it. Starting early makes this dramatically easier — the same target needs a far smaller SIP at 30 than at 40.',
      ] },
    ],
    calcs: ['retirement', 'fire', 'swp', 'readiness'],
    faqs: [
      { q: 'Is ₹1 crore enough to retire in India?', a: 'For most urban households, ₹1 crore alone is not enough for a full retirement once inflation and a 25–30 year horizon are considered. Many need ₹3–5 crore or more depending on expenses and city.' },
      { q: 'What is the 4% rule and does it work in India?', a: 'It suggests withdrawing 4% of your corpus a year. Because Indian inflation is higher, a more cautious 3–3.5% is generally recommended, requiring a somewhat larger corpus.' },
    ],
  },
  {
    slug: 'direct-vs-regular-mutual-funds',
    title: 'Direct vs Regular Mutual Funds — The Real Cost | GoalFi',
    description: 'Direct vs regular mutual fund plans explained — how the trail commission in regular plans quietly costs you lakhs, and how to switch to direct. Free calculator.',
    h1: 'Direct vs regular mutual funds: the real cost of commission',
    intro: 'Direct and regular plans hold the exact same portfolio with the same fund manager. The only difference is cost — and over time that difference is enormous.',
    sections: [
      { heading: 'What you are actually paying for', body: [
        'A regular plan pays your distributor a trail commission, built into a higher expense ratio — typically 0.5% to 1% more than the direct plan of the same fund. A direct plan has no distributor, so its expense ratio is lower and more of your money stays invested.',
        'That gap looks tiny on a fact sheet, but it compounds against you every single year. On a ₹25,000/month SIP over 20 years, a 1% higher expense ratio can quietly cost several lakhs.',
      ] },
      { heading: 'When regular plans make sense', body: [
        'If you genuinely rely on an advisor who adds value, that guidance has a price. But you are usually better off paying a flat fee-only advisor and buying direct plans — it costs far less than the trail commission baked into regular plans for life.',
      ] },
      { heading: 'How to switch to direct', body: [
        'Buy direct plans through the AMC website, MF Central, or a zero-commission platform. You can switch existing regular holdings to direct, though it counts as a redemption-and-repurchase for tax, so mind any exit load and capital gains.',
      ] },
    ],
    calcs: ['directregular', 'indexactive', 'sip'],
    faqs: [
      { q: 'Are direct mutual funds better than regular?', a: 'For do-it-yourself investors, yes — direct plans have lower expense ratios because they cut the distributor commission, so they deliver higher returns on the same fund over time.' },
      { q: 'How much do regular plans cost extra?', a: 'Usually 0.5–1% a year in higher expense ratio. Compounded over 15–20 years on a meaningful SIP, that can add up to several lakhs of lost returns.' },
    ],
  },
];

export const guideBySlug = Object.fromEntries(GUIDES.map(g => [g.slug, g]));
