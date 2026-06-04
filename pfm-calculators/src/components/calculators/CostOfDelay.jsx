import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, calcSIPFromCorpus, formatINR } from '../../utils/financialCalc';

export default function CostOfDelay({ onNavigate }) {
  const [s, set] = useCalcState('costofdelay', {
    monthly: 20000, endYears: 25, delay: 5, rate: 12,
  });

  const r = useMemo(() => {
    // Start now: SIP runs the full horizon.
    const now = calcSIP(s.monthly, s.rate, s.endYears).corpus;
    // Start later: same SIP, but only for (endYears − delay) years.
    const investingYears = Math.max(0, s.endYears - s.delay);
    const later = calcSIP(s.monthly, s.rate, investingYears).corpus;
    const cost = now - later;
    // To still hit the "start now" corpus despite delaying, you'd need this SIP:
    const catchUpSIP = investingYears > 0 ? calcSIPFromCorpus(now, s.rate, investingYears) : 0;

    const data = [];
    for (let y = 0; y <= s.endYears; y++) {
      const nowC = calcSIP(s.monthly, s.rate, y).corpus;
      const laterYears = Math.max(0, y - s.delay);
      const laterC = laterYears > 0 ? calcSIP(s.monthly, s.rate, laterYears).corpus : 0;
      data.push({ year: y, startNow: Math.round(nowC), startLater: Math.round(laterC) });
    }
    return { now, later, cost, catchUpSIP, investingYears, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`What waiting ${s.delay} years costs you`}
        value={r.cost}
        gradient="rose"
        sub={`Same ${formatINR(s.monthly)}/mo SIP — starting now vs ${s.delay} years from today, both ending in year ${s.endYears}`}
        meta={[
          { label: 'Start today', value: formatINR(r.now, true) },
          { label: `Start in ${s.delay} yrs`, value: formatINR(r.later, true) },
          { label: 'Cost of waiting', value: formatINR(r.cost, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Procrastination is the most expensive money habit. Investing <strong>{formatINR(s.monthly)}/mo</strong> from today reaches <strong className="text-[#1E1963]">{formatINR(r.now)}</strong> in {s.endYears} years. Wait just <strong>{s.delay} years</strong> to start and you end with only <strong>{formatINR(r.later)}</strong> — a <strong className="text-[#E33434]">{formatINR(r.cost)}</strong> hole, despite investing for {r.investingYears} years. To still reach the same number after the delay, you'd have to invest <strong>{formatINR(r.catchUpSIP)}/mo</strong> instead. The early years matter most — they compound the longest.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Plan</p>
        <SliderInput label="Monthly SIP" value={s.monthly} min={1000} max={500000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Years until you need the money" value={s.endYears} min={5} max={40} onChange={v => set({ endYears: v })} unit=" yr" />
          <SliderInput label="Years you'd delay starting" value={s.delay} min={1} max={Math.max(2, s.endYears - 1)} onChange={v => set({ delay: v })} unit=" yr" />
          <SliderInput label="Expected return" value={s.rate} min={6} max={18} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">The gap that never closes</p>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="nowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'startNow' ? 'Start today' : `Start in ${s.delay} yrs`]} labelFormatter={l => `Year ${l}`} />
            <Legend formatter={v => v === 'startNow' ? 'Start today' : `Start in ${s.delay} years`} iconType="plainline" wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="startNow" stroke="#1E1963" strokeWidth={2.5} fill="url(#nowGrad)" dot={false} />
            <Area type="monotone" dataKey="startLater" stroke="#E33434" strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The takeaway</p>
        <p className="text-sm text-slate-700">
          You can't buy back compounding time. Even a <strong>small SIP started today</strong> usually beats a much larger one started a few years later. If you can't invest the full amount yet, start with whatever you can and step it up — just start.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Project starting today' },
        { id: 'stepup', label: 'Step-Up SIP', desc: 'Start small, raise it yearly' },
        { id: 'crorepati', label: 'Crorepati Timeline', desc: 'When you hit ₹1 Cr' },
      ]} />
    </div>
  );
}
