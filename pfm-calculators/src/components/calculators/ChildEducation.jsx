import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcInflation, calcSIPFromCorpus, calcSIP, formatINR } from '../../utils/financialCalc';

export default function ChildEducation({ onNavigate }) {
  const [s, set] = useCalcState('education', {
    currentCost: 2500000, years: 15, eduInflation: 10, returnPct: 12, currentSavings: 0,
  });

  const r = useMemo(() => {
    const futureCost = calcInflation(s.currentCost, s.eduInflation, s.years);
    const savingsGrowth = s.currentSavings * Math.pow(1 + s.returnPct / 100, s.years);
    const additional = Math.max(0, futureCost - savingsGrowth);
    const sipNeeded = calcSIPFromCorpus(additional, s.returnPct, s.years);
    const lumpsumNeeded = additional / Math.pow(1 + s.returnPct / 100, s.years);
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      data.push({
        year: y,
        corpus: Math.round(calcSIP(sipNeeded, s.returnPct, y).corpus + savingsGrowth / Math.pow(1 + s.returnPct / 100, s.years - y)),
        cost: Math.round(calcInflation(s.currentCost, s.eduInflation, y)),
      });
    }
    return { futureCost, savingsGrowth, additional, sipNeeded, lumpsumNeeded, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`What this education will cost in ${s.years} years`}
        value={r.futureCost}
        gradient="rose"
        sub={`At ${s.eduInflation}% education inflation — you'll need to invest about ${formatINR(r.sipNeeded)}/month to get there`}
        meta={[
          { label: 'Future cost', value: formatINR(r.futureCost, true) },
          { label: 'Monthly SIP needed', value: formatINR(r.sipNeeded) },
          { label: 'Or lumpsum today', value: formatINR(r.lumpsumNeeded, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Education inflates faster than everything else — professional degrees in India rise around <strong>10% a year</strong>, well above general inflation. A course costing <strong>{formatINR(s.currentCost)}</strong> today will cost <strong className="text-[#E33434]">{formatINR(r.futureCost)}</strong> in {s.years} years. To fund it{s.currentSavings > 0 ? <> (after your current {formatINR(s.currentSavings)} grows)</> : ''}, start a SIP of <strong>{formatINR(r.sipNeeded)}/month</strong> now, or set aside <strong>{formatINR(r.lumpsumNeeded)}</strong> as a lumpsum today.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">The Goal</p>
        <SliderInput label="Cost of education (today)" value={s.currentCost} min={200000} max={50000000} step={100000} onChange={v => set({ currentCost: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Years until needed" value={s.years} min={1} max={25} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Education inflation" hint="Degrees rise ~10%/yr" value={s.eduInflation} min={5} max={15} step={0.5} onChange={v => set({ eduInflation: v })} unit="%" />
          <SliderInput label="Expected return" value={s.returnPct} min={6} max={16} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
          <SliderInput label="Already saved for this" value={s.currentSavings} min={0} max={50000000} step={50000} onChange={v => set({ currentSavings: v })} prefix="₹" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Your plan vs the rising cost</p>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eduGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'corpus' ? 'Your corpus' : 'Cost of education']} labelFormatter={l => `Year ${l}`} />
            <ReferenceLine y={r.futureCost} stroke="#CA8D1B" strokeDasharray="4 4" label={{ value: 'Target', fill: '#CA8D1B', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="cost" stroke="#E33434" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            <Area type="monotone" dataKey="corpus" stroke="#1E1963" strokeWidth={2.5} fill="url(#eduGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Parent's playbook</p>
        <p className="text-sm text-slate-700">
          Start the moment the child is born — 18 years of compounding does most of the work. Use equity funds for goals 7+ years away, then shift to safer debt in the last 2–3 years so a market dip doesn't hit you right before admission. Keep this goal separate from retirement; never raid retirement savings for education.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'goal', label: 'Goal Planner', desc: 'Plan any other goal' },
        { id: 'ssy', label: 'Sukanya Samriddhi', desc: 'For a daughter, tax-free' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Project the SIP' },
      ]} />
    </div>
  );
}
