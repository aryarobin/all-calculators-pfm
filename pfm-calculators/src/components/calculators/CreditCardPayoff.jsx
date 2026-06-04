import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Simulate paying a fixed amount each month against a revolving balance.
function simulate(balance, apr, monthlyPayment) {
  const r = apr / 100 / 12;
  let bal = balance, months = 0, interest = 0;
  const data = [{ month: 0, balance: Math.round(bal) }];
  const minFirst = bal * r + 1; // payment must at least cover interest
  if (monthlyPayment <= minFirst) return { months: Infinity, interest: Infinity, data, neverPays: true };
  while (bal > 0 && months < 600) {
    const i = bal * r;
    interest += i;
    bal = bal + i - monthlyPayment;
    months++;
    if (bal < 0) bal = 0;
    if (months % 1 === 0) data.push({ month: months, balance: Math.round(Math.max(0, bal)) });
  }
  return { months, interest, totalPaid: balance + interest, data, neverPays: false };
}

// "Minimum payment" path: pay max(5% of balance, ₹200) each month — the trap.
function simulateMinimum(balance, apr) {
  const r = apr / 100 / 12;
  let bal = balance, months = 0, interest = 0;
  while (bal > 0 && months < 1200) {
    const i = bal * r;
    const pay = Math.max(bal * 0.05, 200);
    interest += i;
    bal = bal + i - pay;
    months++;
    if (bal < 1) bal = 0;
  }
  return { months, interest };
}

export default function CreditCardPayoff({ onNavigate }) {
  const [s, set] = useCalcState('creditcard', { balance: 100000, apr: 42, payment: 10000 });

  const r = useMemo(() => simulate(s.balance, s.apr, s.payment), [s]);
  const min = useMemo(() => simulateMinimum(s.balance, s.apr), [s.balance, s.apr]);

  const yrs = r.months / 12;

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${formatINR(s.balance)} at ${s.apr}% APR · paying ${formatINR(s.payment)}/mo`}
        value={r.neverPays ? 0 : Math.round(r.interest)}
        rawValue={r.neverPays ? 'Never paid off' : formatINR(r.interest)}
        gradient="rose"
        sub={r.neverPays
          ? 'Your payment barely covers interest — the balance will never clear. Increase it.'
          : `Total interest you'll pay — debt-free in ${r.months} months (${yrs.toFixed(1)} years)`}
        meta={[
          { label: 'Months to clear', value: r.neverPays ? '∞' : `${r.months}` },
          { label: 'Total you repay', value: r.neverPays ? '—' : formatINR(r.totalPaid, true) },
          { label: 'Interest % of debt', value: r.neverPays ? '—' : `${Math.round(r.interest / s.balance * 100)}%` },
        ]}
      />

      <div className="bg-[#E33434]/5 border border-[#E33434]/15 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#E33434] uppercase tracking-widest mb-1">The minimum-payment trap</p>
        <p className="text-sm text-slate-700">
          Paying only the <strong>5% minimum</strong> each month, this {formatINR(s.balance)} debt would take <strong className="text-[#E33434]">{(min.months / 12).toFixed(1)} years</strong> and cost <strong className="text-[#E33434]">{formatINR(min.interest)}</strong> in interest. Paying a fixed {formatINR(s.payment)}/mo instead {r.neverPays ? 'still isn\'t enough — raise it.' : `saves you ${formatINR(min.interest - r.interest)}.`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Card</p>
        <SliderInput label="Outstanding balance" value={s.balance} min={5000} max={2000000} step={5000} onChange={v => set({ balance: v })} prefix="₹" hint="Tap to type" />
        <SliderInput label="Interest rate (APR)" hint="Indian cards: 36–48% per year" value={s.apr} min={12} max={48} step={1} onChange={v => set({ apr: v })} unit="%" />
        <SliderInput label="Monthly payment" hint={`Must exceed first-month interest (${formatINR(Math.round(s.balance * s.apr / 100 / 12))})`} value={s.payment} min={1000} max={500000} step={1000} onChange={v => set({ payment: v })} prefix="₹" />
      </div>

      {!r.neverPays && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-800 mb-4">Balance falling to zero</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E33434" stopOpacity={0.28} />
                  <stop offset="90%" stopColor="#E33434" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `M${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(r.months / 8))} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [formatINR(v), 'Balance']} labelFormatter={l => `Month ${l}`} />
              <Area type="monotone" dataKey="balance" stroke="#E33434" strokeWidth={2.5} fill="url(#ccGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Smart move</p>
        <p className="text-sm text-slate-700">
          At {s.apr}% APR, credit-card debt is the most expensive money you'll ever borrow — far above any investment return. Clear it before investing, and consider a balance transfer or a personal loan (~12-14%) to cut the rate.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emi', label: 'EMI Calculator', desc: 'Personal loan to refinance the card' },
        { id: 'budget', label: 'Budget Planner', desc: 'Free up cash to clear it faster' },
        { id: 'emergency', label: 'Emergency Fund', desc: 'Avoid future card debt' },
      ]} />
    </div>
  );
}
