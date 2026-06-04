import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcEMI, formatINR } from '../../utils/financialCalc';

export default function BalanceTransfer({ onNavigate }) {
  const [s, set] = useCalcState('balancetransfer', {
    outstanding: 4000000, currentRate: 9.5, newRate: 8.4, tenure: 15, processingPct: 0.5,
  });

  const r = useMemo(() => {
    const cur = calcEMI(s.outstanding, s.currentRate, s.tenure);
    const nw = calcEMI(s.outstanding, s.newRate, s.tenure);
    const processingFee = s.outstanding * s.processingPct / 100;
    const interestSaved = cur.totalInterest - nw.totalInterest;
    const netSaving = interestSaved - processingFee;
    const emiDrop = cur.emi - nw.emi;
    // Breakeven: months for EMI saving to recover the processing fee
    const breakevenMonths = emiDrop > 0 ? Math.ceil(processingFee / emiDrop) : 0;
    return { cur, nw, processingFee, interestSaved, netSaving, emiDrop, breakevenMonths };
  }, [s]);

  const worth = r.netSaving > 0;

  return (
    <div className="space-y-4">
      <HeroCard
        label="Net saving from a balance transfer"
        value={r.netSaving}
        gradient={worth ? 'emerald' : 'rose'}
        sub={worth
          ? `After the ${formatINR(r.processingFee)} processing fee, switching to ${s.newRate}% still saves you money`
          : `The rate cut is too small to beat the processing fee — not worth switching`}
        meta={[
          { label: 'Interest saved', value: formatINR(r.interestSaved, true) },
          { label: 'Less processing fee', value: `−${formatINR(r.processingFee, true)}` },
          { label: 'EMI drops by', value: `${formatINR(r.emiDrop)}/mo` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Moving your <strong>{formatINR(s.outstanding)}</strong> loan from <strong>{s.currentRate}%</strong> to <strong>{s.newRate}%</strong> over {s.tenure} years cuts your EMI by <strong>{formatINR(r.emiDrop)}</strong> and total interest by <strong>{formatINR(r.interestSaved)}</strong>. After the <strong>{formatINR(r.processingFee)}</strong> processing fee, the net saving is <strong className={worth ? 'text-[#3EA23C]' : 'text-[#E33434]'}>{formatINR(r.netSaving)}</strong>{worth ? <>, and you recover the fee in about <strong>{r.breakevenMonths} months</strong></> : ''}. As a rule, a balance transfer is worth it when the rate gap is <strong>0.5%+</strong> and meaningful tenure remains.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Loan</p>
        <SliderInput label="Outstanding balance" value={s.outstanding} min={100000} max={100000000} step={100000} onChange={v => set({ outstanding: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current interest rate" value={s.currentRate} min={6} max={16} step={0.05} onChange={v => set({ currentRate: v })} unit="%" />
          <SliderInput label="New (transfer) rate" value={s.newRate} min={6} max={16} step={0.05} onChange={v => set({ newRate: v })} unit="%" />
          <SliderInput label="Remaining tenure" value={s.tenure} min={1} max={30} onChange={v => set({ tenure: v })} unit=" yr" />
          <SliderInput label="Processing fee" hint="Often 0.25–1% of loan" value={s.processingPct} min={0} max={2} step={0.05} onChange={v => set({ processingPct: v })} unit="%" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current loan</p>
          <p className="text-lg font-bold text-slate-800">{formatINR(r.cur.emi)}<span className="text-xs font-medium text-slate-400">/mo</span></p>
          <p className="text-xs text-slate-500 mt-1">Total interest {formatINR(r.cur.totalInterest, true)}</p>
        </div>
        <div className="bg-[#3EA23C]/5 rounded-2xl border border-[#3EA23C]/20 p-4">
          <p className="text-[11px] font-bold text-[#3EA23C] uppercase tracking-widest mb-2">After transfer</p>
          <p className="text-lg font-bold text-slate-800">{formatINR(r.nw.emi)}<span className="text-xs font-medium text-slate-400">/mo</span></p>
          <p className="text-xs text-slate-500 mt-1">Total interest {formatINR(r.nw.totalInterest, true)}</p>
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Before you switch</p>
        <p className="text-sm text-slate-700">
          First ask your current lender to match the lower rate — a small conversion fee is often cheaper than a full transfer. Watch for legal/valuation charges beyond the headline processing fee, and only transfer when significant tenure remains, since late-tenure EMIs are mostly principal with little interest left to save.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emi', label: 'EMI Calculator', desc: 'Recompute your schedule' },
        { id: 'prepayimpact', label: 'Prepayment Impact', desc: 'Or prepay to save interest' },
        { id: 'prepay', label: 'Prepay vs Invest', desc: 'Best use of surplus' },
      ]} />
    </div>
  );
}
