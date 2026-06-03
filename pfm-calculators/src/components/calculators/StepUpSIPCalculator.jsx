import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcStepUpSIP, calcSIP, formatINR } from '../../utils/financialCalc';

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow p-2.5 text-xs">
      <p className="font-semibold text-slate-600 mb-1">Year {label}</p>
      {payload.map(p => <div key={p.name} className="flex justify-between gap-5"><span className="text-slate-400">{p.name}</span><span className="font-semibold" style={{ color: p.color }}>{formatINR(p.value)}</span></div>)}
    </div>
  );
};

export default function StepUpSIPCalculator({ onNavigate }) {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(15);
  const [stepUp, setStepUp] = useState(10);

  const stepUpResult = useMemo(() => calcStepUpSIP(monthly, rate, years, stepUp), [monthly, rate, years, stepUp]);
  const normalResult = useMemo(() => calcSIP(monthly, rate, years), [monthly, rate, years]);

  const extraWealth = stepUpResult.corpus - normalResult.corpus;
  const extraPct = normalResult.corpus > 0 ? Math.round(extraWealth / normalResult.corpus * 100) : 0;

  const finalSIP = useMemo(() => {
    let s = monthly;
    for (let i = 0; i < years; i++) s *= (1 + stepUp / 100);
    return Math.round(s);
  }, [monthly, years, stepUp]);

  const chartData = useMemo(() => stepUpResult.yearlyData.map(row => ({
    ...row,
    normalCorpus: Math.round(calcSIP(monthly, rate, row.year).corpus),
  })), [stepUpResult, monthly, rate]);

  return (
    <div className="space-y-4">
      {/* Story header */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="px-6 pt-6 pb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Scenario</p>
          <p className="text-xl font-bold text-slate-800 leading-snug">
            Starting at <span className="text-blue-700">{formatINR(monthly)}/mo</span>, increasing by <span className="text-blue-700">{stepUp}%</span> every year for <span className="text-blue-700">{years} years</span>
          </p>
        </div>
        <div className="px-6 pb-4">
          <p className="text-xs text-slate-400 mb-1">Total corpus with step-up</p>
          <p className="text-5xl font-black text-blue-700 leading-none">{formatINR(stepUpResult.corpus)}</p>
          <div className="flex gap-6 mt-3">
            <div>
              <p className="text-xs text-slate-400">Without step-up</p>
              <p className="text-base font-bold text-slate-500">{formatINR(normalResult.corpus)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Extra corpus</p>
              <p className="text-base font-bold text-emerald-600">+{formatINR(extraWealth)} (+{extraPct}%)</p>
            </div>
          </div>
        </div>
        <div className="px-6 pb-5">
          <div className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-xs text-blue-700 font-medium">
              Your SIP grows from <strong>{formatINR(monthly)}/mo</strong> today to <strong>{formatINR(finalSIP)}/mo</strong> by year {years}. This matches your salary hike automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-white rounded-xl border border-slate-100 px-6 py-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Adjust Parameters</p>
        <SliderInput label="Starting Monthly SIP" value={monthly} min={500} max={500000} step={500} onChange={setMonthly} prefix="₹" hint="Tap the value to type any amount" />
        <SliderInput label="Annual Step-Up Rate" hint="Match with your expected salary hike %" value={stepUp} min={0} max={50} step={1} onChange={setStepUp} unit="%" />
        <SliderInput label="Expected Annual Return" value={rate} min={4} max={30} step={0.5} onChange={setRate} unit="%" />
        <SliderInput label="Duration" value={years} min={1} max={40} onChange={setYears} unit=" yr" />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-slate-100 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Step-Up SIP vs Fixed SIP</p>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="stepGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="10%" stopColor="#1d4ed8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={65} axisLine={false} tickLine={false} />
            <Tooltip content={<TTip />} />
            <Area type="monotone" dataKey="corpus" name="Step-Up SIP" stroke="#1d4ed8" strokeWidth={2} fill="url(#stepGrad)" />
            <Area type="monotone" dataKey="normalCorpus" name="Fixed SIP" stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {onNavigate && (
        <div className="bg-white rounded-xl border border-slate-100 p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">Continue your journey</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[{ id: 'goal', label: 'Plan a Goal', desc: 'How much SIP for a goal?' }, { id: 'retirement', label: 'Retirement Planner', desc: 'SIP needed to retire comfortably' }, { id: 'compare', label: 'Compare Instruments', desc: 'Where should you invest this SIP?' }].map(n => (
              <button key={n.id} onClick={() => onNavigate(n.id)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{n.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
