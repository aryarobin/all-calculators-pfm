import { useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const TAX_FREE_CAP = 2000000; // ₹20L lifetime exemption

export default function GratuityCalculator({ onNavigate }) {
  const [s, set] = useCalcState('gratuity', {
    salary: 50000, years: 10,
  });

  const r = useMemo(() => {
    // Payment of Gratuity Act: (15/26) × last drawn (basic + DA) × years of service
    const gratuity = (15 / 26) * s.salary * s.years;
    const taxFree = Math.min(gratuity, TAX_FREE_CAP);
    const taxable = Math.max(0, gratuity - TAX_FREE_CAP);
    const eligible = s.years >= 5;
    return { gratuity, taxFree, taxable, eligible };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Gratuity you'll receive"
        value={r.gratuity}
        gradient="emerald"
        sub={r.eligible
          ? `Tax-free up to ₹20 lakh${r.taxable > 0 ? ` — ${formatINR(r.taxable, true)} above that is taxable` : ''}`
          : `You need 5 years of continuous service to be eligible for gratuity`}
        meta={[
          { label: 'Gratuity amount', value: formatINR(r.gratuity, true) },
          { label: 'Tax-free', value: formatINR(r.taxFree, true) },
          { label: 'Taxable', value: formatINR(r.taxable, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Gratuity rewards long service. Under the Payment of Gratuity Act, it's <strong>15/26 of your last drawn monthly salary</strong> (basic + DA) for <strong>every completed year</strong>. With a {formatINR(s.salary)} basic and {s.years} years, that's <strong className="text-[#3EA23C]">{formatINR(r.gratuity)}</strong>. It's <strong>fully tax-free up to ₹20 lakh</strong> over your lifetime.{!r.eligible && <> Note: gratuity is only payable after <strong>5 years</strong> of continuous service.</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Details</p>
        <SliderInput label="Last drawn monthly (basic + DA)" value={s.salary} min={10000} max={500000} step={1000} onChange={v => set({ salary: v })} prefix="₹" hint="Tap to type" />
        <SliderInput label="Years of service" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The fine print</p>
        <p className="text-sm text-slate-700">
          Service beyond 6 months in a year counts as a full year (e.g. 10 years 7 months = 11 years). Gratuity is based on <strong>basic + DA only</strong>, not your full CTC. The ₹20 lakh tax-free limit is cumulative across all employers in your lifetime. Some companies use 30 days instead of 26 — check your policy.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'salary', label: 'CTC & Salary', desc: 'Decode your full salary' },
        { id: 'epf', label: 'EPF Calculator', desc: 'Your other exit corpus' },
        { id: 'lumpsum', label: 'Lumpsum Calculator', desc: 'Invest the payout well' },
      ]} />
    </div>
  );
}
