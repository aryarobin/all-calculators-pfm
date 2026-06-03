import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcFD, calcRD, calcPPF, calcNPS, formatINR } from '../../utils/financialCalc';

const TABS = [
  { id: 'fd',  label: 'FD',  name: 'Fixed Deposit',         color: 'blue',   gradient: 'from-blue-600 to-blue-700' },
  { id: 'rd',  label: 'RD',  name: 'Recurring Deposit',     color: 'teal',   gradient: 'from-teal-500 to-teal-600' },
  { id: 'ppf', label: 'PPF', name: 'Public Provident Fund', color: 'emerald',gradient: 'from-emerald-600 to-green-700' },
  { id: 'nps', label: 'NPS', name: 'National Pension System',color: 'indigo', gradient: 'from-indigo-600 to-blue-700' },
];

const STORIES = {
  fd:  { title: 'Park a lump sum, collect guaranteed returns',  sub: 'Capital-protected growth with quarterly compounding. Best for short-term goals.' },
  rd:  { title: 'Build wealth one month at a time',            sub: 'Disciplined saving habit with guaranteed returns — no market risk.' },
  ppf: { title: 'India\'s most tax-efficient safe investment',  sub: 'EEE status: contributions, growth, and withdrawal are ALL tax-free.' },
  nps: { title: 'Build your retirement income for life',       sub: 'Market-linked returns while working, then a monthly pension forever.' },
};

const MetricCard = ({ label, value, sub, bg = 'bg-slate-50', textColor = 'text-slate-700', labelColor = 'text-slate-500' }) => (
  <div className={`rounded-xl p-4 ${bg}`}>
    <p className={`text-xs font-bold uppercase tracking-wide ${labelColor}`}>{label}</p>
    <p className={`text-xl font-black mt-0.5 ${textColor}`}>{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const chartTooltipFormatter = (v) => formatINR(v);

export default function FDPPFCalculator({ onNavigate }) {
  const [s, set] = useCalcState('fdppf', {
    tab: 'fd',
    fdAmount: 100000,
    fdRate: 7,
    fdYears: 5,
    rdMonthly: 5000,
    rdRate: 6.5,
    rdYears: 5,
    ppfYearly: 150000,
    ppfYears: 15,
    npsMonthly: 5000,
    npsYears: 25,
    npsReturn: 10,
  });

  // Results
  const fdResult  = useMemo(() => calcFD(s.fdAmount, s.fdRate, s.fdYears), [s.fdAmount, s.fdRate, s.fdYears]);
  const rdResult  = useMemo(() => calcRD(s.rdMonthly, s.rdRate, s.rdYears), [s.rdMonthly, s.rdRate, s.rdYears]);
  const ppfResult = useMemo(() => calcPPF(s.ppfYearly, s.ppfYears), [s.ppfYearly, s.ppfYears]);
  const npsResult = useMemo(() => calcNPS(s.npsMonthly, s.npsYears, s.npsReturn), [s.npsMonthly, s.npsYears, s.npsReturn]);

  // Chart data
  const fdChart = useMemo(() =>
    Array.from({ length: s.fdYears }, (_, i) => {
      const r = calcFD(s.fdAmount, s.fdRate, i + 1);
      return { year: i + 1, maturity: Math.round(r.maturity), principal: s.fdAmount };
    }), [s.fdAmount, s.fdRate, s.fdYears]);

  const rdChart = useMemo(() =>
    Array.from({ length: s.rdYears }, (_, i) => {
      const r = calcRD(s.rdMonthly, s.rdRate, i + 1);
      return { year: i + 1, maturity: Math.round(r.maturity), invested: Math.round(r.invested) };
    }), [s.rdMonthly, s.rdRate, s.rdYears]);

  const ppfChart = useMemo(() => ppfResult.yearlyData, [ppfResult]);

  const npsChart = useMemo(() =>
    Array.from({ length: s.npsYears }, (_, i) => {
      const r = calcNPS(s.npsMonthly, i + 1, s.npsReturn);
      const invested = s.npsMonthly * 12 * (i + 1);
      return { year: i + 1, corpus: Math.round(r.corpus), invested: Math.round(invested) };
    }), [s.npsMonthly, s.npsYears, s.npsReturn]);

  // Cross-tab comparison: normalize to same monthly investment
  const compareMonthly = Math.round(s.npsMonthly);
  const compData = useMemo(() => {
    const years = 15;
    const fdMonthlyEquiv = calcFD(compareMonthly * 12, s.fdRate, years);
    const rdC  = calcRD(compareMonthly, s.rdRate, years);
    const ppfC = calcPPF(compareMonthly * 12, years);
    const npsC = calcNPS(compareMonthly, years, s.npsReturn);
    const invested = compareMonthly * 12 * years;
    return [
      { label: 'FD',  maturity: Math.round(fdMonthlyEquiv.maturity), invested, color: '#3b82f6' },
      { label: 'RD',  maturity: Math.round(rdC.maturity),            invested, color: '#14b8a6' },
      { label: 'PPF', maturity: Math.round(ppfC.maturity),           invested, color: '#10b981' },
      { label: 'NPS', maturity: Math.round(npsC.corpus),             invested, color: '#6366f1' },
    ];
  }, [compareMonthly, s.fdRate, s.rdRate, s.npsReturn]);

  const currentTab = TABS.find(t => t.id === s.tab);
  const story = STORIES[s.tab];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">FD / RD / PPF / NPS Calculator</h2>
        <p className="text-slate-500 mt-1">India's most popular safe investment instruments — calculated and compared</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-xl flex-wrap justify-center mx-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => set({ tab: t.id })}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              s.tab === t.id
                ? 'bg-white shadow text-orange-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Story header */}
      <div className="text-center px-4">
        <p className="text-lg font-bold text-slate-800">{story.title}</p>
        <p className="text-sm text-slate-500 mt-0.5">{story.sub}</p>
      </div>

      {/* ── FD TAB ── */}
      {s.tab === 'fd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-1">
            <SliderInput
              label="Deposit Amount"
              value={s.fdAmount}
              min={10000} max={10000000} step={10000}
              onChange={v => set({ fdAmount: v })}
              prefix="₹"
              hint="One-time lump sum you lock in"
            />
            <SliderInput
              label="Annual Interest Rate"
              value={s.fdRate}
              min={4} max={9} step={0.25}
              onChange={v => set({ fdRate: v })}
              unit="%"
              hint="SBI ~7%, HDFC ~7.1%, Small Finance Banks up to 9%"
            />
            <SliderInput
              label="Tenure"
              value={s.fdYears}
              min={1} max={10}
              onChange={v => set({ fdYears: v })}
              unit=" yrs"
            />
            <div className="mt-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-1">Tax Note</p>
              <p className="text-sm text-amber-800">FD interest is taxable as per your income slab. TDS is deducted if interest exceeds ₹40,000/year.</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Hero */}
            <div className={`card bg-gradient-to-br ${currentTab.gradient} text-white border-0`}>
              <p className="text-sm font-semibold opacity-80">Maturity Amount</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(fdResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">in {s.fdYears} {s.fdYears === 1 ? 'year' : 'years'} at {s.fdRate}% p.a.</p>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Invested" value={formatINR(s.fdAmount)} />
              <MetricCard label="Interest Earned" value={formatINR(fdResult.interest)} bg="bg-blue-50" textColor="text-blue-700" labelColor="text-blue-500" />
              <MetricCard
                label="Effective Return"
                value={`${((fdResult.interest / s.fdAmount) * 100).toFixed(1)}%`}
                sub="total over tenure"
                bg="bg-slate-50"
              />
            </div>

            {/* Growth chart */}
            <div className="card">
              <p className="text-xs font-bold text-slate-500 mb-3">FD Value Over Time</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={fdChart}>
                  <defs>
                    <linearGradient id="fdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Area type="monotone" dataKey="maturity" name="FD Value" stroke="#3b82f6" fill="url(#fdGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="principal" name="Principal" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── RD TAB ── */}
      {s.tab === 'rd' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-1">
            <SliderInput
              label="Monthly Deposit"
              value={s.rdMonthly}
              min={500} max={100000} step={500}
              onChange={v => set({ rdMonthly: v })}
              prefix="₹"
              hint="Amount you commit to depositing every month"
            />
            <SliderInput
              label="Annual Interest Rate"
              value={s.rdRate}
              min={4} max={9} step={0.25}
              onChange={v => set({ rdRate: v })}
              unit="%"
              hint="Compounded quarterly, similar to FD rates"
            />
            <SliderInput
              label="Tenure"
              value={s.rdYears}
              min={1} max={10}
              onChange={v => set({ rdYears: v })}
              unit=" yrs"
            />
            <div className="mt-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <p className="text-xs font-bold text-amber-700 mb-1">Tax Note</p>
              <p className="text-sm text-amber-800">RD interest is taxable like FD — added to income and taxed per slab. TDS applies above ₹40,000/year.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`card bg-gradient-to-br ${currentTab.gradient} text-white border-0`}>
              <p className="text-sm font-semibold opacity-80">Maturity Amount</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(rdResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">in {s.rdYears} {s.rdYears === 1 ? 'year' : 'years'} at {s.rdRate}%</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Total Deposited" value={formatINR(rdResult.invested)} />
              <MetricCard label="Interest Earned" value={formatINR(rdResult.interest)} bg="bg-teal-50" textColor="text-teal-700" labelColor="text-teal-500" />
              <MetricCard
                label="Effective Return"
                value={`${((rdResult.interest / rdResult.invested) * 100).toFixed(1)}%`}
                sub="total over tenure"
              />
            </div>

            <div className="card">
              <p className="text-xs font-bold text-slate-500 mb-3">RD Corpus Growth</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={rdChart}>
                  <defs>
                    <linearGradient id="rdGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Area type="monotone" dataKey="maturity" name="RD Value" stroke="#14b8a6" fill="url(#rdGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="invested" name="Deposited" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── PPF TAB ── */}
      {s.tab === 'ppf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-1">
            <SliderInput
              label="Yearly Investment"
              value={s.ppfYearly}
              min={500} max={150000} step={1000}
              onChange={v => set({ ppfYearly: v })}
              prefix="₹"
              hint="Max ₹1.5L/year — fully eligible for 80C deduction"
            />
            <SliderInput
              label="PPF Duration"
              value={s.ppfYears}
              min={15} max={50} step={5}
              onChange={v => set({ ppfYears: v })}
              unit=" yrs"
              hint="Minimum 15 years; extendable in 5-year blocks"
            />

            {/* EEE highlight */}
            <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-sm font-black text-emerald-700 mb-1">EEE Tax Status — Fully Tax Free at Maturity</p>
              <ul className="text-sm text-emerald-800 space-y-0.5">
                <li><span className="font-semibold">Exempt</span> at investment — 80C deduction up to ₹1.5L</li>
                <li><span className="font-semibold">Exempt</span> during growth — interest not taxed annually</li>
                <li><span className="font-semibold">Exempt</span> at withdrawal — entire maturity is tax-free</li>
              </ul>
              <p className="text-xs text-emerald-600 mt-2">Current PPF rate: 7.1% p.a. (govt-set, reviewed quarterly)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`card bg-gradient-to-br ${currentTab.gradient} text-white border-0`}>
              <p className="text-sm font-semibold opacity-80">PPF Maturity Value</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(ppfResult.maturity)}</p>
              <p className="text-sm opacity-75 mt-1">100% TAX FREE after {s.ppfYears} years</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricCard label="Total Invested" value={formatINR(ppfResult.totalInvested)} />
              <MetricCard
                label="Tax-Free Interest"
                value={formatINR(ppfResult.totalInterest)}
                bg="bg-emerald-50"
                textColor="text-emerald-700"
                labelColor="text-emerald-600"
              />
              <MetricCard
                label="Effective Return"
                value={`${((ppfResult.totalInterest / ppfResult.totalInvested) * 100).toFixed(0)}%`}
                sub="total, fully tax-free"
              />
            </div>

            <div className="card">
              <p className="text-xs font-bold text-slate-500 mb-3">PPF Balance Growth</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={ppfChart}>
                  <defs>
                    <linearGradient id="ppfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Area type="monotone" dataKey="balance" name="PPF Balance" stroke="#10b981" fill="url(#ppfGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="invested" name="Total Invested" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ── NPS TAB ── */}
      {s.tab === 'nps' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card space-y-1">
            <SliderInput
              label="Monthly Contribution"
              value={s.npsMonthly}
              min={500} max={100000} step={500}
              onChange={v => set({ npsMonthly: v })}
              prefix="₹"
              hint="Extra ₹50K tax deduction under 80CCD(1B) over 80C"
            />
            <SliderInput
              label="Years to Retirement"
              value={s.npsYears}
              min={5} max={40}
              onChange={v => set({ npsYears: v })}
              unit=" yrs"
            />
            <SliderInput
              label="Expected Annual Return"
              value={s.npsReturn}
              min={6} max={14} step={0.5}
              onChange={v => set({ npsReturn: v })}
              unit="%"
              hint="Aggressive ~12%, Moderate ~10%, Conservative ~8%"
            />
            <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs font-bold text-indigo-700 mb-1">NPS Withdrawal Rules</p>
              <p className="text-sm text-indigo-800">At age 60: withdraw 60% as tax-free lump sum, use 40% to buy an annuity for monthly pension for life.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`card bg-gradient-to-br ${currentTab.gradient} text-white border-0`}>
              <p className="text-sm font-semibold opacity-80">NPS Corpus at Retirement</p>
              <p className="text-2xl sm:text-4xl font-black mt-1">{formatINR(npsResult.corpus)}</p>
              <p className="text-sm opacity-75 mt-1">in {s.npsYears} years at {s.npsReturn}% return</p>
            </div>

            {/* Lumpsum + Pension breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 bg-blue-50 border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Lumpsum (60%)</p>
                <p className="text-xl font-black text-blue-700 mt-0.5">{formatINR(npsResult.lumpsum)}</p>
                <p className="text-xs text-blue-400 mt-0.5">Tax-free withdrawal at 60</p>
              </div>
              <div className="rounded-xl p-4 bg-purple-50 border border-purple-100">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Annuity Corpus (40%)</p>
                <p className="text-xl font-black text-purple-700 mt-0.5">{formatINR(npsResult.annuityCorpus)}</p>
                <p className="text-xs text-purple-400 mt-0.5">Invested in annuity plan</p>
              </div>
            </div>

            {/* Monthly pension hero */}
            <div className="rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border border-purple-100">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-1">Estimated Monthly Pension</p>
              <p className="text-3xl font-black text-purple-700">{formatINR(npsResult.monthlyPension)}<span className="text-base font-semibold">/month</span></p>
              <p className="text-xs text-purple-400 mt-1">Based on 6% annuity rate (market rates vary 5–8%)</p>
            </div>

            <div className="card">
              <p className="text-xs font-bold text-slate-500 mb-3">Corpus Growth to Retirement</p>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={npsChart}>
                  <defs>
                    <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={v => `Yr ${v}`} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={v => formatINR(v, true)} width={65} />
                  <Tooltip formatter={chartTooltipFormatter} />
                  <Area type="monotone" dataKey="corpus" name="NPS Corpus" stroke="#6366f1" fill="url(#npsGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="invested" name="Contributed" stroke="#94a3b8" fill="none" strokeDasharray="4 4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Cross-tab comparison */}
      <div className="card">
        <p className="text-sm font-bold text-slate-700 mb-1">Instrument Comparison — Same {formatINR(compareMonthly)}/month for 15 years</p>
        <p className="text-xs text-slate-400 mb-4">How all four instruments compare at the same monthly investment (using your current rate inputs)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {compData.map(item => {
            const gain = ((item.maturity - item.invested) / item.invested * 100).toFixed(0);
            return (
              <div
                key={item.label}
                onClick={() => set({ tab: item.label.toLowerCase() })}
                className={`rounded-xl p-4 border-2 cursor-pointer transition-all ${
                  s.tab === item.label.toLowerCase()
                    ? 'border-orange-400 bg-orange-50'
                    : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <p className="text-xs font-black text-slate-500 mb-1">{item.label}</p>
                <p className="text-lg font-black text-slate-800">{formatINR(item.maturity, true)}</p>
                <p className="text-xs text-slate-400 mt-0.5">+{gain}% total</p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-slate-400 mt-3">Note: FD uses lump-sum equivalent; NPS returns are market-linked estimates; PPF is at 7.1% fixed. Click a card to switch tabs.</p>
      </div>

      {/* Next steps */}
      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'compare', label: 'Compare All Instruments', desc: 'FD vs RD vs PPF vs NPS vs SIP — full comparison' },
        { id: 'tax',     label: 'Tax Calculator',         desc: 'See how each instrument affects your tax outgo' },
        { id: 'sip',     label: 'SIP Calculator',         desc: 'Could equity SIPs do better? Find out' },
      ]} />
    </div>
  );
}
