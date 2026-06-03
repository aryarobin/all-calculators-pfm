import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { calcLumpsumYearly, formatINR, calcMultipleTime } from '../../utils/financialCalc';

const TooltipContent = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1.5">Year {label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex justify-between gap-6 mb-0.5">
          <span className="text-slate-500">{p.name}</span>
          <span className="font-semibold" style={{ color: p.color }}>{formatINR(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function LumpsumCalculator({ onNavigate }) {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const data = useMemo(() => calcLumpsumYearly(principal, rate, years), [principal, rate, years]);
  const result = data[data.length - 1] || { corpus: 0, invested: principal, gains: 0 };

  const doubleYear = useMemo(() => Math.ceil(calcMultipleTime(2, rate)), [rate]);
  const tripleYear = useMemo(() => Math.ceil(calcMultipleTime(3, rate)), [rate]);
  const tenXYear = useMemo(() => Math.ceil(calcMultipleTime(10, rate)), [rate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-1">
        <div className="card">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">Parameters</p>
          <SliderInput label="Investment Amount" hint="One-time amount you invest today" value={principal} min={10000} max={10000000} step={10000} onChange={setPrincipal} prefix="₹" />
          <SliderInput label="Expected Annual Return (CAGR)" hint="Nifty 50 20yr avg ~15%, FD ~7%" value={rate} min={4} max={25} step={0.5} onChange={setRate} unit="%" />
          <SliderInput label="Duration" hint="Leave untouched for how long" value={years} min={1} max={40} onChange={setYears} unit=" yr" />

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Milestones at {rate}% CAGR</p>
            <div className="space-y-1.5">
              {[{ label: '2× (Double)', year: doubleYear }, { label: '3× (Triple)', year: tripleYear }, { label: '10×', year: tenXYear }].map(m => (
                <div key={m.label} className="flex justify-between items-center text-xs px-2.5 py-1.5 rounded-lg bg-slate-50">
                  <span className="text-slate-600 font-medium">{m.label}</span>
                  <span className={`font-bold ${m.year <= years ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {m.year <= 60 ? `Year ${m.year}` : '>60 yrs'}
                    {m.year <= years && ' ✓'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="card col-span-3 sm:col-span-1 bg-blue-700 border-0 text-white">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Future Value</p>
            <p className="text-2xl font-bold mt-1">{formatINR(result.corpus)}</p>
            <p className="text-xs opacity-60 mt-1">after {years} years</p>
          </div>
          <div className="card">
            <p className="label-text">Principal</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatINR(principal)}</p>
            <p className="text-xs text-slate-400 mt-1">Invested once</p>
          </div>
          <div className="card">
            <p className="label-text">Total Returns</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatINR(result.gains)}</p>
            <p className="text-xs text-slate-400 mt-1">{(result.corpus / principal).toFixed(1)}× multiplied</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <p className="section-title mb-0">Growth trajectory over {years} years</p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>Future value</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block"></span>Principal</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="lumpsumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={65} />
              <Tooltip content={<TooltipContent />} />
              {doubleYear <= years && <ReferenceLine x={doubleYear} stroke="#f97316" strokeDasharray="3 3" label={{ value: '2×', fill: '#f97316', fontSize: 10 }} />}
              {tripleYear <= years && <ReferenceLine x={tripleYear} stroke="#10b981" strokeDasharray="3 3" label={{ value: '3×', fill: '#10b981', fontSize: 10 }} />}
              <Area type="monotone" dataKey="corpus" name="Future Value" stroke="#1d4ed8" strokeWidth={2} fill="url(#lumpsumGrad)" />
              <Area type="monotone" dataKey="invested" name="Principal" stroke="#94a3b8" strokeWidth={1.5} fill="none" strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {onNavigate && (
          <div className="card bg-slate-50 border-slate-200">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Explore next</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[{ id: 'sip', label: 'SIP Calculator' }, { id: 'cagr', label: 'CAGR Calculator' }, { id: 'multiplier', label: 'Money Multiplier' }].map(n => (
                <button key={n.id} onClick={() => onNavigate(n.id)} className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-all text-left">{n.label} →</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
