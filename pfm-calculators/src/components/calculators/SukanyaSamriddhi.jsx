import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// SSY: deposit for 15 years, matures at 21 years from opening. Rate ~8.2% (govt-set, EEE).
function calcSSY(yearlyDeposit, rate) {
  const r = rate / 100;
  let balance = 0, invested = 0;
  const data = [];
  for (let yr = 1; yr <= 21; yr++) {
    if (yr <= 15) { balance += yearlyDeposit; invested += yearlyDeposit; }
    balance = balance * (1 + r);
    data.push({ year: yr, balance: Math.round(balance), invested: Math.round(invested) });
  }
  return { maturity: balance, invested, interest: balance - invested, data };
}

export default function SukanyaSamriddhi({ onNavigate }) {
  const [s, set] = useCalcState('ssy', { yearly: 150000, rate: 8.2, girlAge: 5 });

  const r = useMemo(() => calcSSY(s.yearly, s.rate), [s.yearly, s.rate]);
  const maturityAge = s.girlAge + 21;

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Sukanya Samriddhi · ${formatINR(s.yearly)}/yr for 15 years`}
        value={r.maturity}
        gradient="emerald"
        sub={`100% tax-free maturity when your daughter turns ~${maturityAge} (21 years after opening)`}
        meta={[
          { label: 'You invest', value: formatINR(r.invested, true) },
          { label: 'Interest earned', value: formatINR(r.interest, true) },
          { label: 'Tax on maturity', value: '₹0 (EEE)' },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          You deposit for <strong>15 years</strong>; the account keeps earning until it matures <strong>21 years</strong> after opening. Investing <strong>{formatINR(s.yearly)}/year</strong> grows to <strong className="text-[#3EA23C]">{formatINR(r.maturity)}</strong> — and it's <strong>EEE</strong>: deposits qualify for 80C, and both interest and maturity are fully tax-free.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Plan</p>
        <SliderInput label="Yearly deposit" hint="Min ₹250 · Max ₹1.5L/year (80C limit)" value={s.yearly} min={250} max={150000} step={1000} onChange={v => set({ yearly: v })} prefix="₹" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Interest rate" hint="Govt-set, currently 8.2% p.a." value={s.rate} min={6} max={9} step={0.1} onChange={v => set({ rate: v })} unit="%" />
          <SliderInput label="Daughter's current age" hint="Account can open before age 10" value={s.girlAge} min={0} max={10} onChange={v => set({ girlAge: v })} unit=" yr" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Growth to maturity (21 years)</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ssyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.28} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'balance' ? 'Balance' : 'Invested']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="balance" name="balance" stroke="#3EA23C" strokeWidth={2.5} fill="url(#ssyGrad)" dot={false} />
            <Area type="monotone" dataKey="invested" name="invested" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'goal', label: 'Goal Planner', desc: "Plan your child's education separately" },
        { id: 'fdppf', label: 'PPF / NPS', desc: 'Compare other tax-free options' },
        { id: 'tax', label: 'Income Tax', desc: 'Claim the 80C deduction' },
      ]} />
    </div>
  );
}
