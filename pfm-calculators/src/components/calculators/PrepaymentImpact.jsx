import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcEMI, formatINR, formatYears } from '../../utils/financialCalc';

// Amortise a loan, optionally with a one-time prepayment now + extra monthly,
// keeping the EMI constant so the tenure shrinks. Returns months & interest.
function amortise(principal, ratePct, years, emi, oneTime = 0, extraMonthly = 0) {
  const r = ratePct / 100 / 12;
  let bal = principal - oneTime;
  let interest = 0, month = 0;
  const series = [];
  while (bal > 0.5 && month < years * 12 + 1) {
    month++;
    const intM = bal * r;
    interest += intM;
    let principalPaid = (emi + extraMonthly) - intM;
    if (principalPaid >= bal) { bal = 0; }
    else bal -= principalPaid;
    if (month % 12 === 0 || bal === 0) series.push({ year: +(month / 12).toFixed(1), balance: Math.round(bal) });
  }
  return { months: month, interest, series };
}

export default function PrepaymentImpact({ onNavigate }) {
  const [s, set] = useCalcState('prepayimpact', {
    principal: 5000000, rate: 8.5, tenure: 20, oneTime: 500000, extraMonthly: 0,
  });

  const r = useMemo(() => {
    const emi = calcEMI(s.principal, s.rate, s.tenure).emi;
    const base = amortise(s.principal, s.rate, s.tenure, emi, 0, 0);
    const withPre = amortise(s.principal, s.rate, s.tenure, emi, s.oneTime, s.extraMonthly);
    const interestSaved = base.interest - withPre.interest;
    const monthsSaved = base.months - withPre.months;
    // merge series for chart
    const maxLen = Math.max(base.series.length, withPre.series.length);
    const data = [];
    for (let i = 0; i < maxLen; i++) {
      data.push({
        year: (base.series[i]?.year ?? withPre.series[i]?.year),
        base: base.series[i]?.balance ?? 0,
        withPre: withPre.series[i]?.balance ?? 0,
      });
    }
    return { emi, base, withPre, interestSaved, monthsSaved, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Interest you save by prepaying"
        value={r.interestSaved}
        gradient="emerald"
        sub={`Keeping the same EMI, your loan closes ${formatYears(r.monthsSaved / 12)} earlier`}
        meta={[
          { label: 'Interest saved', value: formatINR(r.interestSaved, true) },
          { label: 'Loan closes', value: `${formatYears(r.monthsSaved / 12)} early` },
          { label: 'New payoff', value: formatYears(r.withPre.months / 12) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          On a {formatINR(s.principal)} loan at {s.rate}% over {s.tenure} years, your EMI is <strong>{formatINR(r.emi)}</strong>. Prepaying <strong>{formatINR(s.oneTime)}</strong> now{s.extraMonthly > 0 ? <> plus <strong>{formatINR(s.extraMonthly)}</strong> extra every month</> : ''} — while keeping the EMI unchanged — saves <strong className="text-[#3EA23C]">{formatINR(r.interestSaved)}</strong> in interest and clears the loan <strong>{formatYears(r.monthsSaved / 12)}</strong> sooner. Prepayments early in the tenure save the most, because that's when your EMI is almost all interest.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Loan</p>
        <SliderInput label="Outstanding loan" value={s.principal} min={100000} max={100000000} step={100000} onChange={v => set({ principal: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Interest rate" value={s.rate} min={6} max={14} step={0.1} onChange={v => set({ rate: v })} unit="%" />
          <SliderInput label="Remaining tenure" value={s.tenure} min={1} max={30} onChange={v => set({ tenure: v })} unit=" yr" />
          <SliderInput label="One-time prepayment (now)" value={s.oneTime} min={0} max={20000000} step={50000} onChange={v => set({ oneTime: v })} prefix="₹" />
          <SliderInput label="Extra every month" value={s.extraMonthly} min={0} max={200000} step={1000} onChange={v => set({ extraMonthly: v })} prefix="₹" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Outstanding balance over time</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />With prepay</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Original</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ppGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.2} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={64} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'withPre' ? 'With prepay' : 'Original']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="base" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            <Area type="monotone" dataKey="withPre" stroke="#3EA23C" strokeWidth={2.5} fill="url(#ppGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Keep EMI, not tenure</p>
        <p className="text-sm text-slate-700">
          After a prepayment, ask the bank to <strong>reduce the tenure, not the EMI</strong> — that's what maximises interest saved. Floating-rate home loans have no prepayment penalty in India. But first check our Prepay vs Invest tool: if your investments reliably out-earn the loan rate, investing may build more wealth.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'prepay', label: 'Prepay vs Invest', desc: 'Prepay or invest the surplus?' },
        { id: 'emi', label: 'EMI Calculator', desc: 'The base schedule' },
        { id: 'balancetransfer', label: 'Balance Transfer', desc: 'Or just cut the rate' },
      ]} />
    </div>
  );
}
