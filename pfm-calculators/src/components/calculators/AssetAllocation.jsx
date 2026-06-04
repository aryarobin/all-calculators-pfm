import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const RULES = [
  { id: 100, label: '100 − age', note: 'Conservative' },
  { id: 110, label: '110 − age', note: 'Balanced' },
  { id: 120, label: '120 − age', note: 'Aggressive' },
];

export default function AssetAllocation({ onNavigate }) {
  const [s, set] = useCalcState('assetalloc', {
    age: 32, corpus: 2000000, currentEquityPct: 80, rule: 110,
  });

  const r = useMemo(() => {
    const recEquityPct = Math.max(20, Math.min(90, s.rule - s.age));
    const recDebtPct = 100 - recEquityPct;
    const equityNow = s.corpus * s.currentEquityPct / 100;
    const recEquity = s.corpus * recEquityPct / 100;
    const shift = recEquity - equityNow; // +ve = move into equity, -ve = book into debt
    const drift = Math.abs(s.currentEquityPct - recEquityPct);
    const pie = [
      { name: 'Equity', value: Math.round(recEquity), color: '#1E1963' },
      { name: 'Debt', value: Math.round(s.corpus - recEquity), color: '#CA8D1B' },
    ];
    return { recEquityPct, recDebtPct, equityNow, recEquity, shift, drift, pie };
  }, [s]);

  const balanced = r.drift <= 5;

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Recommended mix at age ${s.age}`}
        value={r.recEquityPct}
        rawValue={`${r.recEquityPct}% equity · ${r.recDebtPct}% debt`}
        gradient="indigo"
        sub={balanced
          ? `Your portfolio is close to its target — a small or no rebalance is needed`
          : `Your equity is ${s.currentEquityPct > r.recEquityPct ? 'higher' : 'lower'} than recommended by ${r.drift} points — time to rebalance`}
        meta={[
          { label: 'Target equity', value: `${r.recEquityPct}%` },
          { label: 'You hold', value: `${s.currentEquityPct}% equity` },
          { label: r.shift >= 0 ? 'Move to equity' : 'Book into debt', value: formatINR(Math.abs(r.shift), true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          A simple age-based rule keeps risk appropriate: hold roughly <strong>({s.rule} − your age)%</strong> in equity, the rest in debt. At {s.age}, that's <strong className="text-[#1E1963]">{r.recEquityPct}% equity / {r.recDebtPct}% debt</strong>. You're currently at <strong>{s.currentEquityPct}%</strong> equity, so to realign you'd {r.shift >= 0
            ? <>move <strong>{formatINR(Math.abs(r.shift))}</strong> from debt into equity</>
            : <>book <strong>{formatINR(Math.abs(r.shift))}</strong> of equity gains into debt</>}. As you age, glide gradually toward debt to protect what you've built.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col items-center justify-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 self-start">Target allocation</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={r.pie} dataKey="value" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={2} startAngle={90} endAngle={-270}>
                {r.pie.map((p, i) => <Cell key={i} fill={p.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [formatINR(v), n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-5 text-[12px] font-semibold -mt-1">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1E1963] inline-block" />Equity {r.recEquityPct}%</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#CA8D1B] inline-block" />Debt {r.recDebtPct}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Profile</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {RULES.map(rule => (
              <button key={rule.id} onClick={() => set({ rule: rule.id })}
                className={`px-2 py-2 rounded-xl border-2 text-[12px] font-bold transition-all ${s.rule === rule.id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {rule.label}
                <span className="block text-[9px] font-semibold text-slate-400 mt-0.5">{rule.note}</span>
              </button>
            ))}
          </div>
          <SliderInput label="Your age" value={s.age} min={20} max={70} onChange={v => set({ age: v })} unit=" yrs" />
          <SliderInput label="Portfolio value" value={s.corpus} min={50000} max={100000000} step={50000} onChange={v => set({ corpus: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="Current equity allocation" value={s.currentEquityPct} min={0} max={100} onChange={v => set({ currentEquityPct: v })} unit="%" />
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Why rebalance</p>
        <p className="text-sm text-slate-700">
          Rebalancing once a year forces you to sell what's run up and buy what's lagged — selling high, buying low, automatically. It controls risk and removes emotion. Use fresh SIP money to top up the underweight side first; that way you rebalance with minimal tax and no selling.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'networth', label: 'Net Worth Tracker', desc: 'See your full asset mix' },
        { id: 'ltcgharvest', label: 'LTCG Harvesting', desc: 'Rebalance tax-efficiently' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Pick the debt & equity vehicles' },
      ]} />
    </div>
  );
}
