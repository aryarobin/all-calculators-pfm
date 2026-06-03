// ─── Formatting ─────────────────────────────────────────────────────────────

export function formatINR(amount, compact = false) {
  if (isNaN(amount) || !isFinite(amount)) return '₹0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (compact) {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  }

  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;

  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

export function formatPercent(val, decimals = 1) {
  if (isNaN(val) || !isFinite(val)) return '0%';
  return `${val.toFixed(decimals)}%`;
}

export function formatYears(years) {
  const y = Math.floor(years);
  const m = Math.round((years - y) * 12);
  if (m === 0) return `${y} yr${y !== 1 ? 's' : ''}`;
  return `${y} yr${y !== 1 ? 's' : ''} ${m} mo`;
}

// ─── SIP Calculator ─────────────────────────────────────────────────────────

export function calcSIP(monthlyAmount, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) return { corpus: monthlyAmount * n, invested: monthlyAmount * n, gains: 0 };
  const corpus = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const invested = monthlyAmount * n;
  const gains = corpus - invested;
  return { corpus, invested, gains };
}

export function calcSIPYearly(monthlyAmount, annualRate, years) {
  const r = annualRate / 100 / 12;
  const data = [];
  for (let y = 1; y <= years; y++) {
    const n = y * 12;
    const corpus = r === 0
      ? monthlyAmount * n
      : monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const invested = monthlyAmount * n;
    data.push({ year: y, corpus: Math.round(corpus), invested: Math.round(invested), gains: Math.round(corpus - invested) });
  }
  return data;
}

// ─── Lumpsum Calculator ──────────────────────────────────────────────────────

export function calcLumpsum(principal, annualRate, years) {
  const corpus = principal * Math.pow(1 + annualRate / 100, years);
  const gains = corpus - principal;
  return { corpus, invested: principal, gains };
}

export function calcLumpsumYearly(principal, annualRate, years) {
  const data = [];
  for (let y = 1; y <= years; y++) {
    const corpus = principal * Math.pow(1 + annualRate / 100, y);
    data.push({ year: y, corpus: Math.round(corpus), invested: Math.round(principal), gains: Math.round(corpus - principal) });
  }
  return data;
}

// ─── Step-Up SIP ────────────────────────────────────────────────────────────

export function calcStepUpSIP(monthlyAmount, annualRate, years, annualStepUp) {
  const r = annualRate / 100 / 12;
  const stepRate = annualStepUp / 100;
  let corpus = 0;
  let invested = 0;
  let currentSIP = monthlyAmount;

  const yearlyData = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      corpus = (corpus + currentSIP) * (1 + r);
      invested += currentSIP;
    }
    yearlyData.push({ year: y, corpus: Math.round(corpus), invested: Math.round(invested), gains: Math.round(corpus - invested), sip: Math.round(currentSIP) });
    currentSIP = currentSIP * (1 + stepRate);
  }

  return { corpus, invested, gains: corpus - invested, yearlyData };
}

// ─── CAGR ────────────────────────────────────────────────────────────────────

export function calcCAGR(startValue, endValue, years) {
  if (startValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

export function calcFutureValue(presentValue, cagr, years) {
  return presentValue * Math.pow(1 + cagr / 100, years);
}

// ─── XIRR (Newton-Raphson) ──────────────────────────────────────────────────

export function calcXIRR(cashflows) {
  // cashflows: [{amount, date}] - negative for outflows, positive for inflows
  if (!cashflows || cashflows.length < 2) return null;

  const baseDate = cashflows[0].date;
  const years = cashflows.map(cf => (cf.date - baseDate) / (365.25 * 24 * 3600 * 1000));

  function npv(rate) {
    return cashflows.reduce((sum, cf, i) => sum + cf.amount / Math.pow(1 + rate, years[i]), 0);
  }

  function dnpv(rate) {
    return cashflows.reduce((sum, cf, i) => sum - years[i] * cf.amount / Math.pow(1 + rate, years[i] + 1), 0);
  }

  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    const f = npv(rate);
    const df = dnpv(rate);
    if (Math.abs(df) < 1e-12) break;
    const newRate = rate - f / df;
    if (Math.abs(newRate - rate) < 1e-8) { rate = newRate; break; }
    rate = newRate;
  }
  return isFinite(rate) ? rate * 100 : null;
}

// ─── EMI ─────────────────────────────────────────────────────────────────────

export function calcEMI(principal, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) return { emi: principal / n, totalPayment: principal, totalInterest: 0 };
  const emi = principal * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;
  return { emi, totalPayment, totalInterest };
}

export function calcEMISchedule(principal, annualRate, years) {
  const { emi } = calcEMI(principal, annualRate, years);
  const r = annualRate / 100 / 12;
  let balance = principal;
  const schedule = [];

  for (let m = 1; m <= years * 12; m++) {
    const interest = balance * r;
    const principalPaid = emi - interest;
    balance -= principalPaid;
    if (m % 12 === 0) {
      schedule.push({
        year: m / 12,
        emi: Math.round(emi),
        interest: Math.round(interest * 12),
        principal: Math.round(principalPaid * 12),
        balance: Math.max(0, Math.round(balance)),
      });
    }
  }
  return schedule;
}

// ─── Inflation ───────────────────────────────────────────────────────────────

export function calcInflation(presentValue, inflationRate, years) {
  return presentValue * Math.pow(1 + inflationRate / 100, years);
}

export function calcPresentValue(futureValue, inflationRate, years) {
  return futureValue / Math.pow(1 + inflationRate / 100, years);
}

export function calcRealReturn(nominalReturn, inflationRate) {
  return ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
}

// ─── Retirement / FIRE ──────────────────────────────────────────────────────

export function calcRetirement({ currentAge, retirementAge, lifeExpectancy, monthlyExpenses, inflation, preRetirementReturn, postRetirementReturn, currentSavings }) {
  const yearsToRetire = retirementAge - currentAge;
  const yearsInRetirement = lifeExpectancy - retirementAge;

  const monthlyExpensesAtRetirement = calcInflation(monthlyExpenses, inflation, yearsToRetire);
  const annualExpensesAtRetirement = monthlyExpensesAtRetirement * 12;

  const r = postRetirementReturn / 100;
  const g = inflation / 100;
  let corpusNeeded;

  if (Math.abs(r - g) < 0.001) {
    corpusNeeded = annualExpensesAtRetirement * yearsInRetirement;
  } else {
    corpusNeeded = annualExpensesAtRetirement * (1 - Math.pow((1 + g) / (1 + r), yearsInRetirement)) / (r - g);
  }

  const growthOfCurrentSavings = currentSavings * Math.pow(1 + preRetirementReturn / 100, yearsToRetire);
  const additionalCorpusNeeded = Math.max(0, corpusNeeded - growthOfCurrentSavings);

  const sipForRetirement = calcSIPFromCorpus(additionalCorpusNeeded, preRetirementReturn, yearsToRetire);

  return {
    monthlyExpensesAtRetirement,
    corpusNeeded,
    growthOfCurrentSavings,
    additionalCorpusNeeded,
    sipNeeded: sipForRetirement,
    yearsToRetire,
    yearsInRetirement,
  };
}

export function calcSIPFromCorpus(targetCorpus, annualRate, years) {
  const n = years * 12;
  const r = annualRate / 100 / 12;
  if (r === 0) return targetCorpus / n;
  return targetCorpus * r / (((Math.pow(1 + r, n) - 1)) * (1 + r));
}

// ─── Goal Planning ───────────────────────────────────────────────────────────

export function calcGoal({ goalAmount, yearsToGoal, inflation, expectedReturn, currentSavings }) {
  const futureGoalAmount = calcInflation(goalAmount, inflation, yearsToGoal);
  const growthOfCurrentSavings = currentSavings * Math.pow(1 + expectedReturn / 100, yearsToGoal);
  const additionalNeeded = Math.max(0, futureGoalAmount - growthOfCurrentSavings);
  const sipRequired = calcSIPFromCorpus(additionalNeeded, expectedReturn, yearsToGoal);
  const lumpsumRequired = additionalNeeded / Math.pow(1 + expectedReturn / 100, yearsToGoal);

  return { futureGoalAmount, growthOfCurrentSavings, additionalNeeded, sipRequired, lumpsumRequired };
}

// ─── FD/RD ───────────────────────────────────────────────────────────────────

export function calcFD(principal, annualRate, years, compoundFrequency = 4) {
  const r = annualRate / 100 / compoundFrequency;
  const n = compoundFrequency * years;
  const maturity = principal * Math.pow(1 + r, n);
  return { maturity, interest: maturity - principal, principal };
}

export function calcRD(monthlyAmount, annualRate, years) {
  const r = annualRate / 100 / 12;
  const n = years * 12;
  let maturity = 0;
  for (let i = 1; i <= n; i++) {
    maturity += monthlyAmount * Math.pow(1 + r, n - i + 1);
  }
  const invested = monthlyAmount * n;
  return { maturity, interest: maturity - invested, invested };
}

// ─── PPF ─────────────────────────────────────────────────────────────────────

export function calcPPF(yearlyAmount, years = 15, rate = 7.1) {
  const r = rate / 100;
  let balance = 0;
  let totalInvested = 0;
  const yearlyData = [];

  for (let y = 1; y <= years; y++) {
    balance = (balance + yearlyAmount) * (1 + r);
    totalInvested += yearlyAmount;
    yearlyData.push({ year: y, balance: Math.round(balance), invested: Math.round(totalInvested), interest: Math.round(balance - totalInvested) });
  }

  return { maturity: balance, totalInvested, totalInterest: balance - totalInvested, yearlyData };
}

// ─── NPS ─────────────────────────────────────────────────────────────────────

export function calcNPS(monthlyContribution, years, expectedReturn, annuityRate = 40) {
  const { corpus } = calcSIP(monthlyContribution, expectedReturn, years);
  const lumpsum = corpus * (1 - annuityRate / 100);
  const annuityCorpus = corpus * (annuityRate / 100);
  const monthlyPension = annuityCorpus * 0.06 / 12; // assuming 6% annuity rate

  return { corpus, lumpsum, annuityCorpus, monthlyPension };
}

// ─── Money Doubling ──────────────────────────────────────────────────────────

export function ruleOf72(rate) {
  return 72 / rate;
}

export function calcDoublingTime(rate) {
  return Math.log(2) / Math.log(1 + rate / 100);
}

export function calcMultipleTime(multiple, rate) {
  if (rate <= 0) return Infinity;
  return Math.log(multiple) / Math.log(1 + rate / 100);
}

export function calcRateForMultiple(multiple, years) {
  return (Math.pow(multiple, 1 / years) - 1) * 100;
}

// ─── Investment Comparison ───────────────────────────────────────────────────

export const INVESTMENT_TYPES = {
  mf_equity: { label: 'Equity MF', defaultReturn: 12, riskLevel: 'High', taxLTCG: 12.5, ltcgThreshold: 1.25, stdDeduction: 1.25 },
  mf_debt: { label: 'Debt MF', defaultReturn: 7, riskLevel: 'Low-Med', taxSlabBased: true },
  ppf: { label: 'PPF', defaultReturn: 7.1, riskLevel: 'None', taxFree: true, lockin: 15 },
  epf: { label: 'EPF', defaultReturn: 8.1, riskLevel: 'None', taxFree: true },
  nps: { label: 'NPS', defaultReturn: 10, riskLevel: 'Med-High', taxBenefit80CCD: true },
  fd: { label: 'Bank FD', defaultReturn: 7, riskLevel: 'None', taxSlabBased: true },
  gold: { label: 'Gold', defaultReturn: 8, riskLevel: 'Medium', taxLTCG: 12.5 },
  realestate: { label: 'Real Estate', defaultReturn: 10, riskLevel: 'Medium-High', taxLTCG: 20 },
};

export function calcPostTaxReturn(preReturn, taxSlab = 30, type = 'mf_equity', years = 10) {
  const info = INVESTMENT_TYPES[type];
  if (!info) return preReturn;
  if (info.taxFree) return preReturn;
  if (info.taxSlabBased) return preReturn * (1 - taxSlab / 100);
  if (info.taxLTCG && years > 1) return preReturn * (1 - info.taxLTCG / 100);
  return preReturn;
}

// ─── Tax Saving ───────────────────────────────────────────────────────────────

export const TAX_SLABS_NEW = [
  { from: 0, to: 400000, rate: 0 },
  { from: 400000, to: 800000, rate: 5 },
  { from: 800000, to: 1200000, rate: 10 },
  { from: 1200000, to: 1600000, rate: 15 },
  { from: 1600000, to: 2000000, rate: 20 },
  { from: 2000000, to: 2400000, rate: 25 },
  { from: 2400000, to: Infinity, rate: 30 },
];

export const TAX_SLABS_OLD = [
  { from: 0, to: 250000, rate: 0 },
  { from: 250000, to: 500000, rate: 5 },
  { from: 500000, to: 1000000, rate: 20 },
  { from: 1000000, to: Infinity, rate: 30 },
];

export function calcTax(income, slabs) {
  let tax = 0;
  for (const slab of slabs) {
    if (income <= slab.from) break;
    const taxable = Math.min(income, slab.to) - slab.from;
    tax += taxable * slab.rate / 100;
  }
  return tax;
}

export function calcIncomeTax({ grossIncome, regime = 'new', deductions80C = 0, deductions80D = 0, hra = 0, lta = 0 }) {
  let taxableIncome = grossIncome;
  const slabs = regime === 'new' ? TAX_SLABS_NEW : TAX_SLABS_OLD;

  if (regime === 'old') {
    const standardDeduction = Math.min(50000, grossIncome);
    taxableIncome -= standardDeduction + Math.min(deductions80C, 150000) + Math.min(deductions80D, 25000) + hra + lta;
    taxableIncome = Math.max(0, taxableIncome);
  } else {
    const standardDeduction = Math.min(75000, grossIncome);
    taxableIncome = Math.max(0, grossIncome - standardDeduction);
  }

  let tax = calcTax(taxableIncome, slabs);
  const cess = tax * 0.04;
  const totalTax = tax + cess;

  // Rebate u/s 87A
  if (regime === 'new' && taxableIncome <= 700000) tax = 0;
  if (regime === 'old' && taxableIncome <= 500000) tax = 0;

  return {
    taxableIncome,
    incomeTax: tax,
    cess: tax * 0.04,
    totalTax: tax + tax * 0.04,
    effectiveRate: grossIncome > 0 ? (tax / grossIncome) * 100 : 0,
    takeHome: grossIncome - tax - tax * 0.04,
  };
}

// ─── SIP Planner (Reverse) ───────────────────────────────────────────────────

export function calcMonthlyNeeded(targetCorpus, currentSavings, annualReturn, years) {
  const growthOfSavings = currentSavings * Math.pow(1 + annualReturn / 100, years);
  const additional = Math.max(0, targetCorpus - growthOfSavings);
  return { monthly: calcSIPFromCorpus(additional, annualReturn, years), lumpsum: additional / Math.pow(1 + annualReturn / 100, years) };
}

// ─── Wealth Timeline ─────────────────────────────────────────────────────────

export function calcWealthTimeline(monthlyInvestment, annualReturn, years, stepUpPercent = 0, lumpsum = 0) {
  const r = annualReturn / 100 / 12;
  const stepRate = stepUpPercent / 100;
  let corpus = lumpsum;
  let invested = lumpsum;
  let currentSIP = monthlyInvestment;
  const data = [];

  for (let y = 1; y <= years; y++) {
    for (let m = 1; m <= 12; m++) {
      corpus = (corpus + currentSIP) * (1 + r);
      invested += currentSIP;
    }
    data.push({
      year: y,
      corpus: Math.round(corpus),
      invested: Math.round(invested),
      gains: Math.round(corpus - invested),
    });
    currentSIP = currentSIP * (1 + stepRate);
  }
  return data;
}
