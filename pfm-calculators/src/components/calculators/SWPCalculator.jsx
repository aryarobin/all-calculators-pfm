import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR, calcIncomePlan, calcInflation } from '../../utils/financialCalc';

// ── Forward SWP: does a corpus sustain a withdrawal? ──────────────────────────
function calcSWP(corpus, monthlyWithdrawal, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  let balance = corpus;
  const data = [];
  let totalWithdrawn = 0, depletedAt = null;
  for (let m = 1; m <= years * 12; m++) {
    balance = balance * (1 + r) - monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
    if (balance <= 0 && !depletedAt) { depletedAt = m; balance = 0; }
    if (m % 12 === 0) data.push({ year: m / 12, balance: Math.max(0, Math.round(balance)) });
  }
  return { data, depletedAt, finalBalance: Math.max(0, balance), totalWithdrawn };
}
function calcMaxSWP(corpus, annualReturn, years) {
  const r = annualReturn / 100 / 12, n = years * 12;
  if (r === 0) return corpus / n;
  return corpus * r / (1 - Math.pow(1 + r, -n));
}
function calcDepletionYears(corpus, monthly, annualReturn) {
  const r = annualReturn / 100 / 12;
  let balance = corpus;
  for (let m = 1; m <= 1200; m++) { balance = balance * (1 + r) - monthly; if (balance <= 0) return +(m / 12).toFixed(1); }
  return null;
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">Year {label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.stroke }} className="font-bold tabular-nums">{formatINR(p.value)}</p>)}
    </div>
  );
};

export default function SWPCalculator({ onNavigate }) {
  const [s, set] = useCalcState('swp', {
    mode: 'need',          // 'need' (reverse) | 'last' (forward)
    // reverse-mode inputs
    incomeToday: 50000, yearsToStart: 20, incomeYears: 25,
    inflation: 6, accReturn: 12, wdReturn: 8, savings: 0,
    // forward-mode inputs
    corpus: 10000000, monthly: 50000, returnRate: 8, years: 25,
  });

  // ── Reverse: how much do I need? ──
  const plan = useMemo(() => calcIncomePlan({
    monthlyIncomeToday: s.incomeToday, yearsToStart: s.yearsToStart, incomeYears: s.incomeYears,
    inflation: s.inflation, accumulationReturn: s.accReturn, withdrawalReturn: s.wdReturn,
    currentSavings: s.savings,
  }), [s.incomeToday, s.yearsToStart, s.incomeYears, s.inflation, s.accReturn, s.wdReturn, s.savings]);

  // ── Forward: will it last? ──
  const fwd = useMemo(() => calcSWP(s.corpus, s.monthly, s.returnRate, s.years), [s.corpus, s.monthly, s.returnRate, s.years]);
  const maxMonthly = useMemo(() => Math.round(calcMaxSWP(s.corpus, s.returnRate, s.years)), [s.corpus, s.returnRate, s.years]);
  const perpetualMonthly = useMemo(() => Math.round(s.corpus * s.returnRate / 100 / 12), [s.corpus, s.returnRate]);
  const sustainable = s.monthly <= maxMonthly;
  const depletionYears = useMemo(() => sustainable ? null : calcDepletionYears(s.corpus, s.monthly, s.returnRate), [s.corpus, s.monthly, s.returnRate, sustainable]);

  return (
    <div className="space-y-4">

      {/* Bidirectional toggle */}
      <div className="bg-slate-100 p-1 rounded-xl flex gap-1">
        <button onClick={() => set({ mode: 'need' })}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${s.mode === 'need' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          How much do I need?
        </button>
        <button onClick={() => set({ mode: 'last' })}
          className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${s.mode === 'last' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}>
          Will my corpus last?
        </button>
      </div>

      {/* ═══════════ REVERSE: target income → corpus → SIP ═══════════ */}
      {s.mode === 'need' && (
        <>
          <HeroCard
            label={`To draw ${formatINR(s.incomeToday)}/mo for ${s.incomeYears} yrs, starting in ${s.yearsToStart} yrs`}
            value={plan.sipRequired}
            rawValue={`${formatINR(plan.sipRequired)}/mo`}
            gradient="emerald"
            sub={`Invest this monthly for ${s.yearsToStart} years to build the corpus you'll live on`}
            meta={[
              { label: 'Corpus needed', value: formatINR(plan.corpusNeeded, true) },
              { label: 'Or lumpsum now', value: formatINR(plan.lumpsumRequired, true) },
              { label: 'Income at start', value: `${formatINR(plan.monthlyIncomeAtStart, true)}/mo` },
            ]}
          />

          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-600">
              Because of inflation, your <strong className="text-slate-900">{formatINR(s.incomeToday)}/mo</strong> lifestyle today will cost <strong className="text-slate-900">{formatINR(plan.monthlyIncomeAtStart)}/mo</strong> when withdrawals begin in {s.yearsToStart} years. To fund that for {s.incomeYears} years you need a <strong className="text-emerald-700">{formatINR(plan.corpusNeeded)}</strong> corpus.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Income Goal</p>
            <SliderInput label="Monthly income you want (today's value)" hint="In today's rupees — we inflate it for you · tap to type" value={s.incomeToday} min={10000} max={2000000} step={5000} onChange={v => set({ incomeToday: v })} prefix="₹" />
            <SliderInput label="Years until income starts" hint="Your accumulation runway" value={s.yearsToStart} min={1} max={40} onChange={v => set({ yearsToStart: v })} unit=" yr" />
            <SliderInput label="How long income must last" hint="e.g. life expectancy − retirement age" value={s.incomeYears} min={5} max={50} onChange={v => set({ incomeYears: v })} unit=" yr" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 pt-2 mt-2 border-t border-slate-100">
              <SliderInput label="Return while building corpus" value={s.accReturn} min={6} max={18} step={0.5} onChange={v => set({ accReturn: v })} unit="%" />
              <SliderInput label="Return during withdrawal" hint="Usually lower / safer" value={s.wdReturn} min={4} max={12} step={0.5} onChange={v => set({ wdReturn: v })} unit="%" />
              <SliderInput label="Inflation" value={s.inflation} min={3} max={10} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
              <SliderInput label="Already saved for this" value={s.savings} min={0} max={100000000} step={100000} onChange={v => set({ savings: v })} prefix="₹" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
            <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1">Live off returns forever</p>
            <p className="text-sm text-blue-800">
              If you build <strong>{formatINR(plan.corpusForPerpetual)}</strong> instead, the real returns alone cover {formatINR(plan.monthlyIncomeAtStart)}/mo — your corpus would <strong>never run out</strong> and could pass to your heirs.
            </p>
          </div>

          <NextSteps onNavigate={onNavigate} steps={[
            { id: 'sip', label: 'SIP Calculator', desc: `See how ${formatINR(plan.sipRequired)}/mo grows` },
            { id: 'retirement', label: 'Retirement Planner', desc: 'Full retirement corpus plan' },
            { id: 'readiness', label: 'Readiness Score', desc: 'Are your assets on track?' },
          ]} />
        </>
      )}

      {/* ═══════════ FORWARD: will my corpus last? ═══════════ */}
      {s.mode === 'last' && (
        <>
          <HeroCard
            label={`Can ${formatINR(s.corpus, true)} sustain ${formatINR(s.monthly)}/mo for ${s.years} yrs?`}
            value={sustainable ? fwd.finalBalance : 0}
            rawValue={sustainable ? 'Yes — sustainable' : `No — runs out in ${depletionYears} yrs`}
            gradient={sustainable ? 'emerald' : 'rose'}
            sub={sustainable
              ? `Lasts ${s.years}+ years, leaving ${formatINR(fwd.finalBalance)} at the end`
              : `${formatINR(s.monthly)}/mo is more than this corpus can support`}
            meta={[
              { label: 'Total withdrawn', value: formatINR(fwd.totalWithdrawn, true) },
              { label: 'Sustainable max', value: `${formatINR(maxMonthly, true)}/mo` },
              { label: 'Forever (interest only)', value: `${formatINR(perpetualMonthly, true)}/mo` },
            ]}
          />

          <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Corpus & Withdrawal</p>
            <SliderInput label="Total corpus" hint="The wealth you've built · tap to type" value={s.corpus} min={1000000} max={500000000} step={500000} onChange={v => set({ corpus: v })} prefix="₹" />
            <SliderInput label="Monthly withdrawal" hint={`Max sustainable for ${s.years} yrs: ${formatINR(maxMonthly)}/mo`} value={s.monthly} min={5000} max={2000000} step={5000} onChange={v => set({ monthly: v })} prefix="₹" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <SliderInput label="Return on corpus" hint="Conservative 6% · Moderate 8%" value={s.returnRate} min={4} max={14} step={0.5} onChange={v => set({ returnRate: v })} unit="%" />
              <SliderInput label="Withdrawal period" value={s.years} min={5} max={50} onChange={v => set({ years: v })} unit=" yr" />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: 'Interest only', val: perpetualMonthly, note: 'never depletes' },
                { label: '4% rule', val: Math.round(s.corpus * 0.04 / 12), note: 'FIRE standard' },
                { label: `Max ${s.years}yr`, val: maxMonthly, note: 'ends at zero' },
              ].map(opt => (
                <button key={opt.label} onClick={() => set({ monthly: opt.val })}
                  className="px-2.5 py-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-left">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{opt.label}</p>
                  <p className="text-sm font-black text-slate-800 tabular-nums">{formatINR(opt.val, true)}</p>
                  <p className="text-[10px] text-slate-400">{opt.note}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <p className="text-sm font-bold text-slate-800 mb-4">Corpus balance over time</p>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={fwd.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="swpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                    <stop offset="90%" stopColor={sustainable ? '#10b981' : '#ef4444'} stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area type="monotone" dataKey="balance" name="Balance" stroke={sustainable ? '#10b981' : '#ef4444'} strokeWidth={2.5} fill="url(#swpGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <NextSteps onNavigate={onNavigate} steps={[
            { id: 'retirement', label: 'Retirement Planner', desc: 'How much corpus to build' },
            { id: 'readiness', label: 'Readiness Score', desc: 'Track all your assets' },
            { id: 'goal', label: 'Goal Planner', desc: 'Set a target & find the SIP' },
          ]} />
        </>
      )}
    </div>
  );
}
