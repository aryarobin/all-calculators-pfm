import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const CITY_TIERS = [
  { id: 'metro', label: 'Metro', base: 1000000, note: 'Mumbai, Delhi, Bangalore' },
  { id: 'tier2', label: 'Tier 2', base: 700000, note: 'Pune, Jaipur, Kochi' },
  { id: 'tier3', label: 'Tier 3', base: 500000, note: 'Smaller cities & towns' },
];

export default function HealthCoverNeeded({ onNavigate }) {
  const [s, set] = useCalcState('healthcover', {
    city: 'metro', familySize: 4, age: 35, currentCover: 500000,
    medInflation: 12, years: 20,
  });

  const r = useMemo(() => {
    const tier = CITY_TIERS.find(t => t.id === s.city) || CITY_TIERS[0];
    // Base hospitalisation cost for one major event today, scaled by family size & age.
    const familyFactor = 1 + (s.familySize - 1) * 0.4;       // each extra member adds risk
    const ageFactor = s.age >= 60 ? 1.8 : s.age >= 45 ? 1.35 : 1;
    const recommendedToday = Math.round(tier.base * familyFactor * ageFactor / 100000) * 100000;
    // What that same cover should be in `years` (medical inflation compounds fast)
    const futureNeed = recommendedToday * Math.pow(1 + s.medInflation / 100, s.years);
    const gap = Math.max(0, recommendedToday - s.currentCover);

    const data = [];
    for (let y = 0; y <= s.years; y++) {
      data.push({
        year: y,
        need: Math.round(recommendedToday * Math.pow(1 + s.medInflation / 100, y)),
        cover: s.currentCover,
      });
    }
    return { tier, recommendedToday, futureNeed, gap, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Health cover your family should carry today"
        value={r.recommendedToday}
        gradient={r.gap > 0 ? 'rose' : 'emerald'}
        sub={r.gap > 0
          ? `You're under-covered by ${formatINR(r.gap, true)} — one hospitalisation could wipe out years of savings`
          : `You're adequately covered for now — revisit as medical costs climb`}
        meta={[
          { label: 'Recommended', value: formatINR(r.recommendedToday, true) },
          { label: 'You have', value: formatINR(s.currentCover, true) },
          { label: `Need in ${s.years} yrs`, value: formatINR(r.futureNeed, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          A single major hospitalisation in a <strong>{r.tier.label.toLowerCase()}</strong> city for a family of <strong>{s.familySize}</strong> can run to <strong>{formatINR(r.recommendedToday)}</strong> today. With medical inflation near <strong>{s.medInflation}%</strong> — almost double regular inflation — that same treatment will cost <strong className="text-[#E33434]">{formatINR(r.futureNeed)}</strong> in {s.years} years. {r.gap > 0
            ? <>Your current <strong>{formatINR(s.currentCover)}</strong> cover leaves a <strong>{formatINR(r.gap)}</strong> gap. Top up with a base policy plus a super top-up — it's cheap and tax-deductible under 80D.</>
            : <>You're set for now, but review every 3–4 years as costs rise.</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Family</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {CITY_TIERS.map(t => (
            <button key={t.id} onClick={() => set({ city: t.id })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${s.city === t.id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {t.label}
              <span className="block text-[9px] font-medium text-slate-400 mt-0.5">{t.note}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Family members covered" value={s.familySize} min={1} max={8} onChange={v => set({ familySize: v })} unit=" people" />
          <SliderInput label="Age of eldest insured" value={s.age} min={20} max={75} onChange={v => set({ age: v })} unit=" yrs" />
          <SliderInput label="Current health cover" value={s.currentCover} min={0} max={5000000} step={100000} onChange={v => set({ currentCover: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="Medical inflation" hint="India runs 10–14%" value={s.medInflation} min={6} max={16} step={0.5} onChange={v => set({ medInflation: v })} unit="%" />
          <SliderInput label="Plan ahead" value={s.years} min={5} max={35} onChange={v => set({ years: v })} unit=" yrs" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">How medical inflation outpaces a fixed cover</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#E33434" stopOpacity={0.2} />
                <stop offset="90%" stopColor="#E33434" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'need' ? 'Cost of treatment' : 'Your cover']} labelFormatter={l => `Year ${l}`} />
            <ReferenceLine y={s.currentCover} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Your cover', fill: '#94a3b8', fontSize: 10, position: 'right' }} />
            <Area type="monotone" dataKey="need" stroke="#E33434" strokeWidth={2.5} fill="url(#hcGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Smart structure</p>
        <p className="text-sm text-slate-700">
          Don't buy one huge policy. Take a <strong>₹5–10L base</strong> plan plus a <strong>₹50L–1Cr super top-up</strong> with a deductible — the combo costs a fraction of a single large policy. Keep it separate from your employer cover, which vanishes when you change jobs.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emergency', label: 'Emergency Fund', desc: 'The cash buffer for what insurance misses' },
        { id: 'termcover', label: 'Term Cover Needed', desc: 'Protect income, not just health' },
        { id: 'tax', label: 'Income Tax', desc: 'Claim 80D on your premiums' },
      ]} />
    </div>
  );
}
