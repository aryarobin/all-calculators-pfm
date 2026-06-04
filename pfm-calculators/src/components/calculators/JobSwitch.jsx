import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Rough cost-of-living index (100 = national baseline), relative to a metro mix.
const CITIES = [
  { id: 'mumbai', label: 'Mumbai', col: 165 },
  { id: 'bangalore', label: 'Bangalore', col: 140 },
  { id: 'delhi', label: 'Delhi NCR', col: 135 },
  { id: 'pune', label: 'Pune', col: 115 },
  { id: 'hyderabad', label: 'Hyderabad', col: 110 },
  { id: 'chennai', label: 'Chennai', col: 108 },
  { id: 'tier2', label: 'Tier-2 city', col: 85 },
];

export default function JobSwitch({ onNavigate }) {
  const [s, set] = useCalcState('jobswitch', {
    currentCTC: 1800000, newCTC: 2400000,
    currentCity: 'pune', newCity: 'bangalore',
  });

  const r = useMemo(() => {
    const cur = CITIES.find(c => c.id === s.currentCity) || CITIES[0];
    const nw = CITIES.find(c => c.id === s.newCity) || CITIES[0];
    const headlineHike = (s.newCTC - s.currentCTC) / s.currentCTC * 100;
    // New CTC expressed in the buying power of your CURRENT city.
    const adjustedNew = s.newCTC * (cur.col / nw.col);
    const realHike = (adjustedNew - s.currentCTC) / s.currentCTC * 100;
    const realGain = adjustedNew - s.currentCTC;

    const bars = [
      { name: 'Current', value: Math.round(s.currentCTC), color: '#94a3b8' },
      { name: 'New (headline)', value: Math.round(s.newCTC), color: '#CA8D1B' },
      { name: 'New (real)', value: Math.round(adjustedNew), color: realHike >= 0 ? '#3EA23C' : '#E33434' },
    ];
    return { cur, nw, headlineHike, adjustedNew, realHike, realGain, bars };
  }, [s]);

  const worth = r.realHike >= 8;

  return (
    <div className="space-y-4">
      <HeroCard
        label={`A ${r.headlineHike.toFixed(0)}% offer — what it's really worth`}
        value={Math.round(r.realHike * 10) / 10}
        rawValue={`${r.realHike >= 0 ? '+' : ''}${r.realHike.toFixed(1)}% real`}
        gradient={r.realHike >= 8 ? 'emerald' : r.realHike >= 0 ? 'amber' : 'rose'}
        sub={worth
          ? `After ${r.nw.label}'s cost of living, this is a genuine raise worth taking`
          : r.realHike >= 0
            ? `The cost of living eats most of the hike — negotiate harder or weigh non-money factors`
            : `In real terms this is a pay cut once ${r.nw.label}'s higher costs are accounted for`}
        meta={[
          { label: 'Headline hike', value: `${r.headlineHike.toFixed(0)}%` },
          { label: 'Real hike', value: `${r.realHike >= 0 ? '+' : ''}${r.realHike.toFixed(0)}%` },
          { label: 'Real gain/yr', value: formatINR(r.realGain, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          The offer looks like a <strong>{r.headlineHike.toFixed(0)}%</strong> jump. But moving from <strong>{r.cur.label}</strong> to <strong>{r.nw.label}</strong> changes what your salary buys — rent, commute, groceries all shift. Adjusted for cost of living, your new {formatINR(s.newCTC)} CTC is worth <strong>{formatINR(r.adjustedNew)}</strong> in {r.cur.label} terms — a <strong className={r.realHike >= 0 ? 'text-[#3EA23C]' : 'text-[#E33434]'}>{r.realHike >= 0 ? '+' : ''}{r.realHike.toFixed(1)}%</strong> real change. {worth ? 'Worth taking on money alone.' : 'Factor in growth, role and learning before deciding.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">The Offer</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current CTC" value={s.currentCTC} min={300000} max={20000000} step={100000} onChange={v => set({ currentCTC: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="New offer CTC" value={s.newCTC} min={300000} max={20000000} step={100000} onChange={v => set({ newCTC: v })} prefix="₹" hint="Tap to type" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">Current city</label>
            <select value={s.currentCity} onChange={e => set({ currentCity: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
              {CITIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">New city</label>
            <select value={s.newCity} onChange={e => set({ newCity: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3">
              {CITIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">CTC adjusted for cost of living</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={r.bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [formatINR(v), 'CTC']} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
              {r.bars.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Before you sign</p>
        <p className="text-sm text-slate-700">
          A common rule: switching jobs is worth it for a <strong>real hike of 20%+</strong>, since you lose tenure, ESOP vesting and comfort. Below ~10% real, weigh the role, manager and learning — money alone won't justify it. Cost-of-living indices are indicative; adjust for your own rent and lifestyle.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'salary', label: 'CTC & Salary', desc: 'In-hand from the new CTC' },
        { id: 'tax', label: 'Income Tax', desc: 'Tax on the new salary' },
        { id: 'budget', label: 'Budget Planner', desc: 'Rework your budget' },
      ]} />
    </div>
  );
}
