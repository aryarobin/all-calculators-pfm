import { useMemo } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, calcFD, calcPPF, calcNPS, formatINR } from '../../utils/financialCalc';

const INSTRUMENTS = [
  {
    id: 'equity_sip',
    label: 'Equity MF SIP',
    shortLabel: 'Equity MF',
    color: '#f97316',
    defaultReturn: 12,
    type: 'sip',
    taxType: 'ltcg',
    ltcgExemption: 125000,
    ltcgRate: 12.5,
    risk: 'High',
  },
  {
    id: 'elss',
    label: 'ELSS',
    shortLabel: 'ELSS',
    color: '#7c3aed',
    defaultReturn: 12,
    type: 'sip',
    taxType: 'ltcg',
    ltcgExemption: 125000,
    ltcgRate: 10,
    risk: 'High',
    lockIn: 3,
    taxSavingPerYear: 46800,
  },
  {
    id: 'ppf',
    label: 'PPF',
    shortLabel: 'PPF',
    color: '#10b981',
    defaultReturn: 7.1,
    type: 'ppf',
    taxType: 'exempt',
    risk: 'None',
    lockIn: 15,
  },
  {
    id: 'fd',
    label: 'Bank FD',
    shortLabel: 'Bank FD',
    color: '#3b82f6',
    defaultReturn: 7,
    type: 'fd',
    taxType: 'slab',
    risk: 'None',
  },
  {
    id: 'nps',
    label: 'NPS',
    shortLabel: 'NPS',
    color: '#6366f1',
    defaultReturn: 10,
    type: 'nps',
    taxType: 'partial',
    risk: 'Med',
    lockIn: -1,
  },
  {
    id: 'gold',
    label: 'Gold',
    shortLabel: 'Gold',
    color: '#f59e0b',
    defaultReturn: 8,
    type: 'sip',
    taxType: 'ltcg',
    ltcgRate: 20,
    risk: 'Med',
  },
];

const NEXT_STEPS = [
  { id: 'sip', label: 'SIP Calculator', desc: 'Model your monthly SIP in detail' },
  { id: 'tax', label: 'Tax Calculator', desc: 'See exact tax savings by instrument' },
  { id: 'goal', label: 'Goal Planner', desc: 'Work backwards from your target' },
];

function calcCorpus(inst, monthly, years) {
  if (inst.type === 'sip') return calcSIP(monthly, inst.defaultReturn, years).corpus;
  if (inst.type === 'ppf') return calcPPF(monthly * 12, years, inst.defaultReturn).maturity;
  if (inst.type === 'fd') return calcFD(monthly * 12, inst.defaultReturn, years).maturity;
  if (inst.type === 'nps') return calcNPS(monthly, years, inst.defaultReturn).corpus;
  return calcSIP(monthly, inst.defaultReturn, years).corpus;
}

function calcPostTax(inst, corpus, invested, taxSlab) {
  const gains = corpus - invested;
  if (inst.taxType === 'exempt') return corpus;
  if (inst.taxType === 'ltcg') {
    const taxableGains = Math.max(0, gains - (inst.ltcgExemption || 0));
    return corpus - taxableGains * (inst.ltcgRate || 12.5) / 100;
  }
  if (inst.taxType === 'slab') return corpus - gains * taxSlab / 100;
  if (inst.taxType === 'partial') return corpus * 0.6; // NPS: 60% lumpsum, 40% annuity
  return corpus;
}

const BAR_TOOLTIP = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs min-w-[160px]">
      <p className="font-bold text-slate-700 mb-1">{d.label}</p>
      <div className="flex justify-between gap-4 mb-0.5">
        <span className="text-slate-400">Pre-Tax</span>
        <span className="font-bold text-slate-700">{formatINR(d.corpus)}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Post-Tax</span>
        <span className="font-bold text-emerald-600">{formatINR(d.postTax)}</span>
      </div>
    </div>
  );
};

export default function InvestmentComparison({ onNavigate }) {
  const [s, set] = useCalcState('compare', {
    monthly: 10000,
    years: 15,
    taxSlab: 30,
    selected: ['equity_sip', 'ppf', 'fd', 'elss'],
  });

  const selectedSet = useMemo(() => new Set(s.selected), [s.selected]);

  const toggle = (id) => {
    const arr = [...selectedSet];
    if (selectedSet.has(id)) {
      if (arr.length > 1) set({ selected: arr.filter(x => x !== id) });
    } else {
      set({ selected: [...arr, id] });
    }
  };

  const results = useMemo(() => {
    const invested = s.monthly * 12 * s.years;
    return INSTRUMENTS.map(inst => {
      const corpus = calcCorpus(inst, s.monthly, s.years);
      const postTax = calcPostTax(inst, corpus, invested, s.taxSlab);
      const taxAmt = corpus - postTax;
      return { ...inst, corpus, invested, gains: corpus - invested, postTax, taxAmt };
    });
  }, [s.monthly, s.years, s.taxSlab]);

  const activeResults = useMemo(
    () => results.filter(r => selectedSet.has(r.id)).sort((a, b) => b.postTax - a.postTax),
    [results, selectedSet]
  );

  const best = activeResults[0];
  const worst = activeResults[activeResults.length - 1];
  const heroDiff = best && worst ? best.postTax - worst.postTax : 0;

  const chartData = activeResults.map(r => ({
    label: r.shortLabel,
    corpus: Math.round(r.corpus),
    postTax: Math.round(r.postTax),
    color: r.color,
  }));

  return (
    <div className="space-y-4">
      {/* Story header + hero */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Investment Comparison
          </p>
          <p className="text-lg font-semibold text-slate-700 leading-snug">
            Same{' '}
            <span className="text-blue-700 font-bold">{formatINR(s.monthly)}/month</span> across
            different instruments for{' '}
            <span className="text-blue-700 font-bold">{s.years} years</span>
          </p>
        </div>

        {heroDiff > 0 && best && worst && (
          <div className="px-6 pb-5 mt-2">
            <p className="text-xs text-slate-400 font-medium mb-1">
              Best vs Worst (post-tax gap)
            </p>
            <p className="text-3xl sm:text-5xl font-black text-emerald-600 leading-none tabular-nums">
              {formatINR(heroDiff)}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              more if you pick{' '}
              <span className="font-bold text-slate-700">{best.label}</span> over{' '}
              <span className="font-bold text-slate-700">{worst.label}</span>
            </p>
          </div>
        )}
      </div>

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Inputs</p>
        <SliderInput
          label="Monthly Investment"
          value={s.monthly}
          min={1000}
          max={100000}
          step={1000}
          onChange={v => set({ monthly: v })}
          prefix="₹"
        />
        <SliderInput
          label="Duration"
          value={s.years}
          min={3}
          max={30}
          onChange={v => set({ years: v })}
          unit=" yrs"
        />
        <SliderInput
          label="Your Tax Slab"
          value={s.taxSlab}
          min={0}
          max={30}
          step={5}
          onChange={v => set({ taxSlab: v })}
          unit="%"
          hint="Used for FD interest & slab-based instruments"
        />
      </div>

      {/* Instrument selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Select Instruments
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {INSTRUMENTS.map(inst => {
            const isOn = selectedSet.has(inst.id);
            return (
              <button
                key={inst.id}
                onClick={() => toggle(inst.id)}
                className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left"
                style={{
                  borderColor: isOn ? inst.color : '#e2e8f0',
                  background: isOn ? inst.color + '14' : '#f8fafc',
                  opacity: isOn ? 1 : 0.6,
                }}
              >
                {/* Checkbox dot */}
                <div
                  className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center"
                  style={{
                    background: isOn ? inst.color : '#e2e8f0',
                    border: `2px solid ${isOn ? inst.color : '#cbd5e1'}`,
                  }}
                >
                  {isOn && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-700 leading-tight truncate">{inst.label}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-bold" style={{ color: inst.color }}>
                      {inst.defaultReturn}%
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0 rounded font-semibold leading-4 ${
                        inst.risk === 'None'
                          ? 'bg-green-100 text-green-700'
                          : inst.risk === 'High'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {inst.risk}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bar chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <p className="text-sm font-bold text-slate-600 mb-4">
          Pre-Tax Corpus after {s.years} years
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={v => formatINR(v, true)}
              width={62}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<BAR_TOOLTIP />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="corpus" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 overflow-x-auto">
        <p className="text-sm font-bold text-slate-600 mb-4">Detailed Breakdown</p>
        <table className="w-full text-xs min-w-[500px]">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2.5 text-slate-400 font-semibold">Instrument</th>
              <th className="text-right py-2.5 text-slate-400 font-semibold">Return%</th>
              <th className="text-right py-2.5 text-slate-400 font-semibold">Pre-Tax</th>
              <th className="text-right py-2.5 text-slate-400 font-semibold">Tax</th>
              <th className="text-right py-2.5 text-slate-400 font-semibold">Post-Tax</th>
              <th className="text-right py-2.5 text-slate-400 font-semibold">Risk</th>
            </tr>
          </thead>
          <tbody>
            {activeResults.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-slate-50 transition-colors ${i === 0 ? 'bg-emerald-50' : ''}`}
              >
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: r.color }}
                    />
                    <span className="font-semibold text-slate-700">{r.label}</span>
                    {i === 0 && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-md leading-tight">
                        BEST
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-2.5 text-right font-bold" style={{ color: r.color }}>
                  {r.defaultReturn}%
                </td>
                <td className="py-2.5 text-right text-slate-600 tabular-nums">
                  {formatINR(r.corpus)}
                </td>
                <td className="py-2.5 text-right text-red-400 tabular-nums">
                  {r.taxAmt > 0 ? `-${formatINR(r.taxAmt)}` : <span className="text-emerald-500">Nil</span>}
                </td>
                <td className="py-2.5 text-right font-bold text-emerald-600 tabular-nums">
                  {formatINR(r.postTax)}
                </td>
                <td className="py-2.5 text-right">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      r.risk === 'None'
                        ? 'bg-green-100 text-green-700'
                        : r.risk === 'High'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {r.risk}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Winner callout */}
      {best && worst && activeResults.length >= 2 && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold opacity-75 uppercase tracking-widest mb-1">Winner</p>
          <p className="text-base font-bold leading-snug">
            Best post-tax:{' '}
            <span className="underline decoration-white/40">{best.label}</span> gives{' '}
            <span className="text-white font-black text-lg tabular-nums">{formatINR(heroDiff)}</span>{' '}
            more than {worst.label} over {s.years} years
          </p>
          <p className="text-xs opacity-70 mt-1.5">
            Based on {s.taxSlab}% tax slab. Equity returns are market-linked — actual results may vary.
          </p>
        </div>
      )}

      {/* Next steps */}
      <NextSteps steps={NEXT_STEPS} onNavigate={onNavigate} />
    </div>
  );
}
