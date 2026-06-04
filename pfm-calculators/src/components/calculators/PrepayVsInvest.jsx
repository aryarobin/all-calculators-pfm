import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcPrepayVsInvest, formatINR } from '../../utils/financialCalc';

export default function PrepayVsInvest({ onNavigate }) {
  const [s, set] = useCalcState('prepay', {
    loanBalance: 4000000, loanRate: 8.5, remainingYears: 15,
    monthlySurplus: 25000, investReturn: 11,
  });

  const r = useMemo(() => calcPrepayVsInvest({
    loanBalance: s.loanBalance, loanRate: s.loanRate, remainingYears: s.remainingYears,
    monthlySurplus: s.monthlySurplus, investReturn: s.investReturn,
  }), [s]);

  const investWins = r.winner === 'invest';

  return (
    <div className="space-y-4">
      <HeroCard
        label={`₹${(s.loanBalance/100000).toFixed(0)}L loan at ${s.loanRate}% · ${formatINR(s.monthlySurplus)}/mo surplus`}
        value={r.difference}
        rawValue={`${investWins ? 'Invest' : 'Prepay'} wins by ${formatINR(r.difference, true)}`}
        gradient={investWins ? 'emerald' : 'blue'}
        sub={investWins
          ? `Investing the surplus beats prepaying — your post-tax return (${s.investReturn}%) outpaces your loan rate (${s.loanRate}%)`
          : `Prepaying wins — guaranteed ${s.loanRate}% saved beats an uncertain ${s.investReturn}% return`}
        meta={[
          { label: 'If you invest', value: formatINR(r.invest.corpus, true) },
          { label: 'If you prepay', value: formatINR(r.prepay.corpus, true) },
          { label: 'Loan closes (prepay)', value: `${r.prepay.loanClosedYears.toFixed(1)} yrs` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          With <strong>{formatINR(s.monthlySurplus)}/mo</strong> extra, <strong>prepaying</strong> clears your loan in <strong className="text-blue-700">{r.prepay.loanClosedYears.toFixed(1)} years</strong> (vs {s.remainingYears}) and saves interest, then invests the freed-up EMI. <strong>Investing</strong> keeps the loan but compounds the surplus from day one. The rule of thumb: invest if your <em>post-tax</em> return beats the loan rate, else prepay — but emotion and liquidity matter too.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Loan & Surplus</p>
        <SliderInput label="Outstanding loan balance" value={s.loanBalance} min={100000} max={50000000} step={100000} onChange={v => set({ loanBalance: v })} prefix="₹" hint="What you still owe · tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Loan interest rate" value={s.loanRate} min={6} max={18} step={0.25} onChange={v => set({ loanRate: v })} unit="%" />
          <SliderInput label="Years left on loan" value={s.remainingYears} min={1} max={30} onChange={v => set({ remainingYears: v })} unit=" yr" />
          <SliderInput label="Monthly surplus to deploy" value={s.monthlySurplus} min={1000} max={500000} step={1000} onChange={v => set({ monthlySurplus: v })} prefix="₹" />
          <SliderInput label="Post-tax investment return" hint="Use after-tax: equity ~11%, debt ~6%" value={s.investReturn} min={4} max={18} step={0.5} onChange={v => set({ investReturn: v })} unit="%" />
        </div>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border-2 p-4 ${!investWins ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Prepay the loan</p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.prepay.corpus, true)}</p>
          <p className="text-xs text-slate-500 mt-1">Final corpus · loan gone in {r.prepay.loanClosedYears.toFixed(1)} yrs</p>
          <p className="text-xs text-slate-400 mt-0.5">Interest paid: {formatINR(r.prepay.interestPaid, true)}</p>
          {!investWins && <p className="text-xs font-bold text-blue-600 mt-2">✓ Winner</p>}
        </div>
        <div className={`rounded-2xl border-2 p-4 ${investWins ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Invest the surplus</p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.invest.corpus, true)}</p>
          <p className="text-xs text-slate-500 mt-1">Final corpus · loan runs full term</p>
          <p className="text-xs text-slate-400 mt-0.5">Interest paid: {formatINR(r.invest.interestPaid, true)}</p>
          {investWins && <p className="text-xs font-bold text-emerald-600 mt-2">✓ Winner</p>}
        </div>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emi', label: 'EMI Calculator', desc: 'See your full loan schedule' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Project the investing path' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Where to invest the surplus' },
      ]} />
    </div>
  );
}
