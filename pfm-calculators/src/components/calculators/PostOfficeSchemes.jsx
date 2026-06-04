import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Post-office / small-savings schemes (rates as of FY 2025-26 quarter).
const SCHEMES = [
  { id: 'nsc',  label: 'NSC',  rate: 7.7, years: 5,  note: 'National Savings Certificate · 5-yr lock-in · interest compounded yearly, taxable (but reinvested interest qualifies for 80C)' },
  { id: 'kvp',  label: 'KVP',  rate: 7.5, years: 9.5, note: 'Kisan Vikas Patra · doubles your money in ~115 months · fully taxable' },
  { id: 'scss', label: 'SCSS', rate: 8.2, years: 5,  note: 'Senior Citizens Savings Scheme · 60+ only · quarterly payout · 80C eligible · max ₹30L' },
  { id: 'mis',  label: 'POMIS', rate: 7.4, years: 5, note: 'Monthly Income Scheme · fixed monthly interest payout · capital returned at maturity' },
];

export default function PostOfficeSchemes({ onNavigate }) {
  const [s, set] = useCalcState('postoffice', {
    scheme: 'nsc', amount: 500000,
  });

  const r = useMemo(() => {
    const calcMaturity = (sc) => {
      if (sc.id === 'mis' || sc.id === 'scss') {
        // Payout schemes: principal returned + total interest paid out over tenure
        const annualInterest = s.amount * sc.rate / 100;
        return { maturity: s.amount + annualInterest * sc.years, payout: annualInterest, returnsCapital: true };
      }
      // Cumulative (compounded annually): NSC, KVP
      return { maturity: s.amount * Math.pow(1 + sc.rate / 100, sc.years), payout: 0, returnsCapital: false };
    };
    const active = SCHEMES.find(x => x.id === s.scheme) || SCHEMES[0];
    const activeRes = calcMaturity(active);
    const bars = SCHEMES.map(sc => {
      const m = calcMaturity(sc);
      return { name: sc.label, value: Math.round(m.maturity), color: sc.id === s.scheme ? '#1E1963' : '#cbd5e1' };
    });
    return { active, activeRes, interest: activeRes.maturity - s.amount, bars };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${r.active.label} on ${formatINR(s.amount)} at ${r.active.rate}%`}
        value={r.activeRes.maturity}
        gradient="blue"
        sub={r.activeRes.returnsCapital
          ? `Pays ${formatINR(r.activeRes.payout / 12)}/month, then returns your ${formatINR(s.amount)} at maturity`
          : `Government-backed, fixed return over ${r.active.years} years — capital fully safe`}
        meta={[
          { label: 'You invest', value: formatINR(s.amount, true) },
          { label: 'Maturity value', value: formatINR(r.activeRes.maturity, true) },
          { label: 'Total interest', value: formatINR(r.interest, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">{r.active.note}.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Scheme</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {SCHEMES.map(sc => (
            <button key={sc.id} onClick={() => set({ scheme: sc.id })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${s.scheme === sc.id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {sc.label}
              <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">{sc.rate}%</span>
            </button>
          ))}
        </div>
        <SliderInput label="Amount to invest" value={s.amount} min={1000} max={5000000} step={10000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Maturity value across schemes</p>
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={r.bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [formatINR(v), 'Maturity']} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
              {r.bars.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-slate-400 mt-3">Note: different tenures — POMIS/SCSS pay interest out (shown as principal + total payouts); NSC/KVP compound. Compare on rate and your need for monthly income vs growth.</p>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Who each suits</p>
        <p className="text-sm text-slate-700">
          <strong>SCSS</strong> is the best fixed-income deal for retirees (8.2%, quarterly payout). <strong>POMIS</strong> suits those needing a steady monthly cheque. <strong>NSC</strong> doubles as an 80C tax-saver. <strong>KVP</strong> simply doubles money — but is fully taxable with no tax break. All are sovereign-safe; for long-term growth, equity still beats them after tax.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'fdppf', label: 'FD / RD / PPF / NPS', desc: 'Other safe options' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Safe vs equity, post-tax' },
        { id: 'realreturn', label: 'Real Return', desc: 'After tax & inflation' },
      ]} />
    </div>
  );
}
