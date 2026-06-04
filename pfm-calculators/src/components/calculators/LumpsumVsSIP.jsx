import { useMemo } from 'react';
import HeroCard from '../shared/HeroCard';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Deploy a windfall: all at once, or stagger via STP over `stpMonths`.
function calcPaths({ amount, years, equityReturn, debtReturn, stpMonths }) {
  const months = years * 12;
  const re = equityReturn / 100 / 12;

  // All-in: entire amount in equity from day one
  const lumpsum = amount * Math.pow(1 + re, months);

  // STP: amount parked in debt, moved to equity in equal tranches over stpMonths
  const rd = debtReturn / 100 / 12;
  const tranche = amount / stpMonths;
  let debtPool = amount, equityPool = 0;
  for (let m = 1; m <= months; m++) {
    // grow both pools one month
    equityPool *= (1 + re);
    debtPool *= (1 + rd);
    // move one tranche from debt to equity during the STP window
    if (m <= stpMonths) {
      const move = Math.min(tranche, debtPool);
      debtPool -= move; equityPool += move;
    }
  }
  const stp = equityPool + debtPool;
  return { lumpsum, stp };
}

export default function LumpsumVsSIP({ onNavigate }) {
  const [s, set] = useCalcState('lumpvssip', {
    amount: 2000000, years: 10, equityReturn: 12, debtReturn: 6.5, stpMonths: 12,
  });

  const r = useMemo(() => calcPaths(s), [s]);
  const lumpsumWins = r.lumpsum >= r.stp;
  const diff = Math.abs(r.lumpsum - r.stp);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Deploying a ${formatINR(s.amount)} windfall over ${s.years} years`}
        value={diff}
        rawValue={`${lumpsumWins ? 'All-in' : 'STP'} ends ${formatINR(diff, true)} ahead`}
        gradient={lumpsumWins ? 'blue' : 'emerald'}
        sub={lumpsumWins
          ? `Investing it all at once usually wins in the long run — markets rise more often than they fall`
          : `Staggering via STP came out ahead at these return assumptions`}
        meta={[
          { label: 'All-in (lumpsum)', value: formatINR(r.lumpsum, true) },
          { label: `STP over ${s.stpMonths} mo`, value: formatINR(r.stp, true) },
          { label: 'Difference', value: formatINR(diff, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Got a bonus, ESOP payout or inheritance? <strong>All-in</strong> puts the full {formatINR(s.amount)} to work in equity today. <strong>STP</strong> parks it in a debt fund and moves it into equity over {s.stpMonths} months — lower average-cost risk if markets dip, but the un-invested money only earns ~{s.debtReturn}% meanwhile. Mathematically all-in usually wins; STP buys peace of mind against bad timing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Windfall</p>
        <SliderInput label="Amount to deploy" value={s.amount} min={100000} max={100000000} step={100000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Investment horizon" value={s.years} min={1} max={30} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="STP window" hint="Months to move debt → equity" value={s.stpMonths} min={3} max={36} onChange={v => set({ stpMonths: v })} unit=" mo" />
          <SliderInput label="Equity return" value={s.equityReturn} min={6} max={18} step={0.5} onChange={v => set({ equityReturn: v })} unit="%" />
          <SliderInput label="Debt return (parking)" value={s.debtReturn} min={4} max={9} step={0.25} onChange={v => set({ debtReturn: v })} unit="%" />
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Rule of thumb</p>
        <p className="text-sm text-slate-700">
          For long horizons (7+ years), invest a windfall <strong>all at once</strong> — time in the market beats timing it. If a large sum makes you nervous, a 6–12 month STP is a reasonable compromise that limits regret if the market drops right after.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'lumpsum', label: 'Lumpsum Calculator', desc: 'Project the all-in path' },
        { id: 'sip', label: 'SIP Calculator', desc: 'For regular monthly investing' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Where to park the debt portion' },
      ]} />
    </div>
  );
}
