import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

export default function NPSCalculator({ onNavigate }) {
  const [s, set] = useCalcState('nps', {
    age: 30, retireAge: 60, monthly: 10000, returnPct: 10, annuityPct: 40, annuityRate: 6,
  });

  const r = useMemo(() => {
    const years = Math.max(1, s.retireAge - s.age);
    const corpus = calcSIP(s.monthly, s.returnPct, years).corpus;
    const invested = s.monthly * 12 * years;
    const lumpsum = corpus * (1 - s.annuityPct / 100);     // up to 60% tax-free at 60
    const annuityCorpus = corpus * s.annuityPct / 100;     // min 40% must buy annuity
    const monthlyPension = annuityCorpus * (s.annuityRate / 100) / 12;
    const data = [];
    for (let y = 1; y <= years; y++) {
      data.push({ year: s.age + y, corpus: Math.round(calcSIP(s.monthly, s.returnPct, y).corpus) });
    }
    return { years, corpus, invested, lumpsum, annuityCorpus, monthlyPension, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Your NPS corpus at ${s.retireAge}`}
        value={r.corpus}
        gradient="indigo"
        sub={`Then ${formatINR(r.lumpsum, true)} as a tax-free lumpsum and about ${formatINR(r.monthlyPension)}/month as pension for life`}
        meta={[
          { label: 'Total corpus', value: formatINR(r.corpus, true) },
          { label: 'Lumpsum (tax-free)', value: formatINR(r.lumpsum, true) },
          { label: 'Monthly pension', value: formatINR(r.monthlyPension) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Investing <strong>{formatINR(s.monthly)}/mo</strong> in NPS from {s.age} to {s.retireAge} builds about <strong className="text-[#1E1963]">{formatINR(r.corpus)}</strong>. At 60 you can withdraw up to <strong>60% ({formatINR(r.lumpsum)}) tax-free</strong>; the remaining <strong>{s.annuityPct}% ({formatINR(r.annuityCorpus)})</strong> buys an annuity paying roughly <strong>{formatINR(r.monthlyPension)}/month</strong> for life (that pension is taxable). NPS also gives an extra <strong>₹50,000</strong> deduction under 80CCD(1B), over and above 80C.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your NPS Plan</p>
        <SliderInput label="Monthly contribution" value={s.monthly} min={500} max={200000} step={500} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current age" value={s.age} min={18} max={59} onChange={v => set({ age: v })} unit=" yrs" />
          <SliderInput label="Retirement age" value={s.retireAge} min={Math.max(40, s.age + 1)} max={75} onChange={v => set({ retireAge: v })} unit=" yrs" />
          <SliderInput label="Expected return" hint="Equity-tilted NPS, long-term" value={s.returnPct} min={6} max={14} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
          <SliderInput label="Annuity portion" hint="Min 40% must buy a pension" value={s.annuityPct} min={40} max={100} step={5} onChange={v => set({ annuityPct: v })} unit="%" />
          <SliderInput label="Annuity rate" hint="Pension provider's payout rate" value={s.annuityRate} min={4} max={8} step={0.25} onChange={v => set({ annuityRate: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">NPS corpus to retirement</p>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="npsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#334BA0" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#334BA0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [formatINR(v), 'Corpus']} labelFormatter={l => `Age ${l}`} />
            <Area type="monotone" dataKey="corpus" stroke="#334BA0" strokeWidth={2.5} fill="url(#npsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Good to know</p>
        <p className="text-sm text-slate-700">
          NPS is low-cost and disciplined, but the forced annuity and lock-in to 60 reduce flexibility, and annuity income is taxable. Many investors use NPS mainly for the extra <strong>₹50k 80CCD(1B)</strong> tax break and build the rest of retirement in equity mutual funds they can access freely.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'epfnpsvpf', label: 'EPF vs NPS vs VPF', desc: 'Which scheme wins?' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Your full retirement need' },
        { id: 'epf', label: 'EPF Calculator', desc: 'Your other retirement pot' },
      ]} />
    </div>
  );
}
