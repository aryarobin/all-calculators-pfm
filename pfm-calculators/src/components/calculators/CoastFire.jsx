import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import GaugeRing from '../shared/GaugeRing';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcCoastFire, formatINR } from '../../utils/financialCalc';

export default function CoastFire({ onNavigate }) {
  const [s, set] = useCalcState('coast', {
    currentAge: 32, retirementAge: 60, monthlyExpenseToday: 80000,
    inflation: 6, swr: 3.5, preReturn: 11, currentCorpus: 3000000,
  });

  const r = useMemo(() => calcCoastFire(s), [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Coast FIRE at ${s.currentAge} · retire at ${s.retirementAge}`}
        value={r.coastNumber}
        gradient={r.hasCoasted ? 'emerald' : 'amber'}
        sub={r.hasCoasted
          ? `You've hit Coast FIRE! You can STOP investing — compounding alone reaches your goal.`
          : `Build this much, then you can stop new investments and let it coast to retirement`}
        meta={[
          { label: 'You have today', value: formatINR(s.currentCorpus, true) },
          { label: 'It grows to', value: formatINR(r.projectedFromCurrent, true) },
          { label: 'FIRE number at 60', value: formatINR(r.fireNumber, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 flex items-center gap-5">
        <GaugeRing pct={r.coveragePct} sublabel="coasted" size={104} />
        <p className="text-sm text-slate-600 flex-1">
          {r.hasCoasted ? (
            <>Your <strong className="text-emerald-700">{formatINR(s.currentCorpus)}</strong> will compound to <strong>{formatINR(r.projectedFromCurrent)}</strong> by {s.retirementAge} — past your FIRE number of <strong>{formatINR(r.fireNumber)}</strong>. New investments now just let you retire <em>earlier</em> or <em>richer</em>.</>
          ) : (
            <>You need <strong className="text-amber-700">{formatINR(r.coastNumber)}</strong> today to coast. You're <strong>{r.coveragePct.toFixed(0)}%</strong> there — keep investing <strong>{formatINR(r.stillNeededToday)}</strong> more (in today's value) to reach the coast point, then you could stop.</>
          )}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Situation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current age" value={s.currentAge} min={20} max={55} onChange={v => set({ currentAge: v })} unit=" yr" />
          <SliderInput label="Retirement age" value={Math.max(s.currentAge + 1, s.retirementAge)} min={s.currentAge + 1} max={70} onChange={v => set({ retirementAge: v })} unit=" yr" />
          <SliderInput label="Monthly expenses today" value={s.monthlyExpenseToday} min={20000} max={1000000} step={5000} onChange={v => set({ monthlyExpenseToday: v })} prefix="₹" />
          <SliderInput label="Corpus you have now" value={s.currentCorpus} min={0} max={200000000} step={100000} onChange={v => set({ currentCorpus: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="Pre-retirement return" value={s.preReturn} min={6} max={16} step={0.5} onChange={v => set({ preReturn: v })} unit="%" />
          <SliderInput label="Safe withdrawal rate" hint="India: 3–3.5% is prudent" value={s.swr} min={2.5} max={5} step={0.25} onChange={v => set({ swr: v })} unit="%" />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1">What is Coast FIRE?</p>
        <p className="text-sm text-blue-800">
          Coast FIRE is the corpus where compounding <em>alone</em> — with no further contributions — grows to your full retirement number by the time you retire. Reach it early and you're free to stop investing aggressively: cover only your living costs and let time do the rest. It's the most liberating milestone on the path to financial independence.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'fire', label: 'Financial Freedom', desc: 'Full FIRE number, after tax' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Corpus + SIP to get there' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Reach the coast number faster' },
      ]} />
    </div>
  );
}
