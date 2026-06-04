import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Employee 12% + employer 3.67% go to EPF; employer's 8.33% goes to EPS (pension).
const EPF_EMP = 0.12, EPF_ER = 0.0367;

export default function EPFCalculator({ onNavigate }) {
  const [s, set] = useCalcState('epf', {
    basic: 40000, currentBalance: 200000, years: 25, hike: 6, rate: 8.25,
  });

  const r = useMemo(() => {
    const rate = s.rate / 100;
    let balance = s.currentBalance;
    let basic = s.basic;
    let contributed = 0;
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      const monthlyContrib = basic * (EPF_EMP + EPF_ER);
      // contributions through the year, then annual interest credit
      for (let m = 0; m < 12; m++) { balance += monthlyContrib; contributed += monthlyContrib; }
      balance *= (1 + rate);
      data.push({ year: y, balance: Math.round(balance), contributed: Math.round(contributed + s.currentBalance) });
      basic *= (1 + s.hike / 100);
    }
    const interest = balance - contributed - s.currentBalance;
    // Rough EPS pension: pensionable salary capped at ₹15,000 → pension = 15000 × service / 70
    const epsPension = 15000 * Math.min(s.years, 35) / 70;
    return { corpus: balance, contributed: contributed + s.currentBalance, interest, epsPension, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Your EPF corpus at retirement"
        value={r.corpus}
        gradient="blue"
        sub={`Tax-free (EEE) at ${s.rate}% — plus a small EPS pension of about ${formatINR(r.epsPension)}/month for life`}
        meta={[
          { label: 'EPF corpus', value: formatINR(r.corpus, true) },
          { label: 'You + employer put in', value: formatINR(r.contributed, true) },
          { label: 'Interest earned', value: formatINR(r.interest, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Each month, <strong>12% of your basic</strong> goes to EPF from you, and the employer adds <strong>3.67%</strong> to EPF plus <strong>8.33%</strong> to the EPS pension scheme. On a {formatINR(s.basic)} basic growing {s.hike}% a year, over {s.years} years your EPF builds to <strong className="text-[#1E1963]">{formatINR(r.corpus)}</strong> — entirely tax-free, earning {s.rate}%. The EPS portion separately funds a modest lifelong pension of around <strong>{formatINR(r.epsPension)}/month</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your EPF</p>
        <SliderInput label="Monthly basic (+ DA)" value={s.basic} min={5000} max={500000} step={1000} onChange={v => set({ basic: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current EPF balance" value={s.currentBalance} min={0} max={50000000} step={50000} onChange={v => set({ currentBalance: v })} prefix="₹" />
          <SliderInput label="Years to retirement" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Annual salary hike" value={s.hike} min={0} max={15} step={0.5} onChange={v => set({ hike: v })} unit="%" />
          <SliderInput label="EPF interest rate" value={s.rate} min={7} max={9} step={0.05} onChange={v => set({ rate: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">EPF growth over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Corpus</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Contributed</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="epfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'balance' ? 'Corpus' : 'Contributed']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="balance" stroke="#1E1963" strokeWidth={2.5} fill="url(#epfGrad)" dot={false} />
            <Area type="monotone" dataKey="contributed" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Make it work harder</p>
        <p className="text-sm text-slate-700">
          Don't withdraw EPF when switching jobs — transfer it so the tax-free compounding continues. Want to save more at the same guaranteed rate? Add <strong>VPF</strong> (Voluntary PF) on top of the mandatory 12%. Interest above a ₹2.5L/year contribution becomes taxable, so very high earners should note that cap.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'epfnpsvpf', label: 'EPF vs NPS vs VPF', desc: 'Where to put more' },
        { id: 'nps', label: 'NPS Calculator', desc: 'Your other retirement pot' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Is it enough overall?' },
      ]} />
    </div>
  );
}
