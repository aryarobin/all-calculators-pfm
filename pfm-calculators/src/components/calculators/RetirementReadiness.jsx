import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import { useCalcState } from '../../hooks/useCalcState';
import { calcInflation, calcSIP, calcSIPFromCorpus, formatINR } from '../../utils/financialCalc';

const ASSETS = [
  { key: 'savings',   label: 'Savings Account', rate: 3.5,  color: '#94a3b8' },
  { key: 'fd',        label: 'FD / RD',          rate: 7,    color: '#3b82f6' },
  { key: 'ppf_epf',   label: 'PPF / EPF',        rate: 8.1,  color: '#10b981' },
  { key: 'mf',        label: 'Mutual Funds',     rate: 12,   color: '#f97316' },
  { key: 'stocks',    label: 'Stocks / Equity',  rate: 15,   color: '#7c3aed' },
  { key: 'gold',      label: 'Gold',             rate: 8,    color: '#f59e0b' },
  { key: 'realestate',label: 'Real Estate',      rate: 9,    color: '#06b6d4' },
];

const DEFAULT_NW  = { savings: 500000, fd: 6000000, ppf_epf: 5000000, mf: 3600000, stocks: 2000000, gold: 7000000, realestate: 0 };
const DEFAULT_MO  = { savings: 0, fd: 30000, ppf_epf: 20000, mf: 100000, stocks: 50000, gold: 0, realestate: 0 };

export default function RetirementReadiness({ onNavigate }) {
  const [s, set] = useCalcState('readiness', {
    currentAge: 44, retirementAge: 65, targetCorpus: 10000000, inflation: 5,
    nw: DEFAULT_NW, mo: DEFAULT_MO,
  });

  const yearsToRetire = Math.max(1, s.retirementAge - s.currentAge);
  const inflatedCorpus = useMemo(() => calcInflation(s.targetCorpus, s.inflation, yearsToRetire), [s.targetCorpus, s.inflation, yearsToRetire]);

  const projections = useMemo(() => ASSETS.map(a => {
    const nwVal  = s.nw[a.key]  || 0;
    const moVal  = s.mo[a.key]  || 0;
    const nwProj = nwVal * Math.pow(1 + a.rate / 100, yearsToRetire);
    const moProj = moVal ? calcSIP(moVal, a.rate, yearsToRetire).corpus : 0;
    return { ...a, nwVal, moVal, nwProj, moProj, total: nwProj + moProj };
  }).filter(a => a.nwVal > 0 || a.moVal > 0), [s.nw, s.mo, yearsToRetire]);

  const totalProjected = projections.reduce((sum, a) => sum + a.total, 0);
  const shortfall  = Math.max(0, inflatedCorpus - totalProjected);
  const surplus    = Math.max(0, totalProjected - inflatedCorpus);
  const score      = Math.min(100, Math.round((totalProjected / inflatedCorpus) * 100));
  const addSIP     = shortfall > 0 ? calcSIPFromCorpus(shortfall, 12, yearsToRetire) : 0;

  const scoreColor = score >= 90 ? '#10b981' : score >= 70 ? '#f59e0b' : score >= 50 ? '#f97316' : '#ef4444';
  const scoreLabel = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Needs Work';

  const updateNW = (key, val) => set(prev => ({ ...prev, nw: { ...prev.nw, [key]: val } }));
  const updateMO = (key, val) => set(prev => ({ ...prev, mo: { ...prev.mo, [key]: val } }));

  const circumference = 2 * Math.PI * 44;
  const dashOffset    = circumference * (1 - score / 100);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">

      {/* Score + headline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row gap-5 items-center">
        {/* Ring */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle cx="50" cy="50" r="44" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeDasharray={`${circumference}`} strokeDashoffset={dashOffset}
              strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tabular-nums" style={{ color: scoreColor }}>{score}</span>
            <span className="text-[11px] text-slate-400 font-semibold">/ 100</span>
          </div>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Retirement Readiness Score</p>
          <p className="text-2xl font-bold" style={{ color: scoreColor }}>{scoreLabel}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 justify-center sm:justify-start">
            <div>
              <p className="text-xs text-slate-400">Target (inflated)</p>
              <p className="text-base font-bold text-slate-700 tabular-nums">{formatINR(inflatedCorpus)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Projected total</p>
              <p className="text-base font-bold text-slate-700 tabular-nums">{formatINR(totalProjected)}</p>
            </div>
          </div>
          {shortfall > 0 ? (
            <div className="mt-3 px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 font-medium">
              Shortfall <strong>{formatINR(shortfall)}</strong> — additional SIP needed: <strong>{formatINR(addSIP)}/mo</strong>
            </div>
          ) : (
            <div className="mt-3 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-700 font-medium">
              Surplus <strong>{formatINR(surplus)}</strong> — you are on track!
            </div>
          )}
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Parameters</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current Age" value={s.currentAge} min={25} max={60} onChange={v => set({ currentAge: v })} unit=" yr" />
          <SliderInput label="Retirement Age" value={Math.max(s.currentAge + 1, s.retirementAge)} min={s.currentAge + 1} max={75} onChange={v => set({ retirementAge: v })} unit=" yr" />
          <SliderInput label="Target Corpus (Today's Value)" value={s.targetCorpus} min={1000000} max={1000000000} step={1000000} onChange={v => set({ targetCorpus: v })} prefix="₹" hint="We'll adjust for inflation" />
          <SliderInput label="Inflation" value={s.inflation} min={3} max={10} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
        </div>
      </div>

      {/* Asset sliders — two cards side by side on ≥ md */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Current Net Worth by Asset</p>
          {ASSETS.map(a => (
            <div key={a.key} className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{a.label}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: a.color }}>{formatINR(s.nw[a.key] || 0)}</span>
              </div>
              <input type="range" min={0} max={100000000} step={100000}
                value={Math.min(s.nw[a.key] || 0, 100000000)}
                onChange={e => updateNW(a.key, +e.target.value)}
                className="w-full"
                style={{ background: `linear-gradient(to right,${a.color} 0%,${a.color} ${Math.min(100, (s.nw[a.key] || 0) / 1000000)}%,#e2e8f0 ${Math.min(100, (s.nw[a.key] || 0) / 1000000)}%,#e2e8f0 100%)` }}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹0</span><span>₹10 Cr</span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Monthly Investment by Asset</p>
          {ASSETS.map(a => (
            <div key={a.key} className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-slate-700">{a.label}</span>
                <span className="text-sm font-bold tabular-nums" style={{ color: a.color }}>{formatINR(s.mo[a.key] || 0)}/mo</span>
              </div>
              <input type="range" min={0} max={500000} step={5000}
                value={Math.min(s.mo[a.key] || 0, 500000)}
                onChange={e => updateMO(a.key, +e.target.value)}
                className="w-full"
                style={{ background: `linear-gradient(to right,${a.color} 0%,${a.color} ${Math.min(100, (s.mo[a.key] || 0) / 5000)}%,#e2e8f0 ${Math.min(100, (s.mo[a.key] || 0) / 5000)}%,#e2e8f0 100%)` }}
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹0</span><span>₹5 L/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Asset summary cards — replaces broken table on mobile */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Projected Corpus by Asset</p>
        <div className="space-y-2">
          {projections.map(a => (
            <div key={a.key} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: a.color }} />
              <span className="text-sm font-semibold text-slate-700 flex-1 min-w-0 truncate">{a.label}</span>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-slate-900 tabular-nums">{formatINR(a.total, true)}</p>
                <p className="text-[11px] text-slate-400">
                  {formatINR(a.nwVal, true)} today
                  {a.moVal > 0 && ` + ${formatINR(a.moVal, true)}/mo`}
                </p>
              </div>
            </div>
          ))}
          {/* Total row */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-orange-50 border border-orange-100">
            <div className="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
            <span className="text-sm font-bold text-slate-800 flex-1">Total Projected</span>
            <span className="text-base font-black text-orange-700 tabular-nums">{formatINR(totalProjected)}</span>
          </div>
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-semibold text-slate-700 mb-4">Asset-wise Projected Corpus at Retirement</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={projections} margin={{ top: 5, right: 5, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-30} textAnchor="end" interval={0} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={65} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n]} />
            <Bar dataKey="nwProj" name="NW Growth" stackId="a">
              {projections.map((a, i) => <Cell key={i} fill={a.color + '88'} />)}
            </Bar>
            <Bar dataKey="moProj" name="SIP Growth" stackId="a" radius={[3, 3, 0, 0]}>
              {projections.map((a, i) => <Cell key={i} fill={a.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
