import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcStepUpSIP, calcSIP, formatINR } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1.5 text-[13px]">Year {label}</p>
      {payload.map(p => <div key={p.name} className="flex justify-between gap-8 mb-0.5"><span className="text-slate-400">{p.name}</span><span className="font-bold tabular-nums" style={{ color: p.color }}>{formatINR(p.value)}</span></div>)}
    </div>
  );
};

export default function StepUpSIPCalculator({ onNavigate }) {
  const [s, set] = useCalcState('stepup', { monthly: 5000, rate: 12, years: 15, stepUp: 10 });

  const stepUpResult = useMemo(() => calcStepUpSIP(s.monthly, s.rate, s.years, s.stepUp), [s]);
  const normalResult = useMemo(() => calcSIP(s.monthly, s.rate, s.years), [s]);

  const extraWealth = stepUpResult.corpus - normalResult.corpus;
  const extraPct = normalResult.corpus > 0 ? Math.round(extraWealth / normalResult.corpus * 100) : 0;

  const finalSIP = useMemo(() => {
    let m = s.monthly;
    for (let i = 0; i < s.years; i++) m *= (1 + s.stepUp / 100);
    return Math.round(m);
  }, [s]);

  const chartData = useMemo(() => stepUpResult.yearlyData.map(row => ({
    ...row,
    normalCorpus: Math.round(calcSIP(s.monthly, s.rate, row.year).corpus),
  })), [stepUpResult, s.monthly, s.rate]);

  return (
    <div className="space-y-4">

      {/* Hero */}
      <HeroCard
        label={`${formatINR(s.monthly)}/mo growing ${s.stepUp}%/yr · ${s.years} yrs`}
        value={stepUpResult.corpus}
        gradient="indigo"
        meta={[
          { label: 'Without step-up', value: formatINR(normalResult.corpus) },
          { label: 'Extra corpus', value: `+${formatINR(extraWealth)}` },
          { label: 'Boost', value: `+${extraPct}%` },
        ]}
      />

      {/* Insight */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Your SIP grows from <strong className="text-blue-700">{formatINR(s.monthly)}/mo</strong> today to <strong className="text-blue-700">{formatINR(finalSIP)}/mo</strong> by year {s.years} — matching your salary hikes automatically.
        </p>
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Adjust & Explore</p>
        <SliderInput label="Starting Monthly SIP" hint="Tap value to type any amount" value={s.monthly} min={500} max={500000} step={500} onChange={v => set({ monthly: v })} prefix="₹" />
        <SliderInput label="Annual Step-Up Rate" hint="Match with your expected salary hike %" value={s.stepUp} min={0} max={50} step={1} onChange={v => set({ stepUp: v })} unit="%" />
        <SliderInput label="Expected Annual Return" value={s.rate} min={4} max={30} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        <SliderInput label="Duration" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Step-Up vs Fixed SIP</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-indigo-600 inline-block" />Step-Up</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Fixed</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.28} />
                <stop offset="90%" stopColor="#4f46e5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <Area type="monotone" dataKey="corpus" name="Step-Up SIP" stroke="#4f46e5" strokeWidth={2.5} fill="url(#stepGrad)" dot={false} activeDot={{ r: 5, fill: '#4f46e5' }} />
            <Area type="monotone" dataKey="normalCorpus" name="Fixed SIP" stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'goal', label: 'Plan a Goal', desc: 'How much SIP for a goal?' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'SIP needed to retire comfortably' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Where to invest this SIP?' },
      ]} />
    </div>
  );
}
