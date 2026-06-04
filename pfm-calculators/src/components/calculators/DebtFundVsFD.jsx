import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function DebtFundVsFD({ onNavigate }) {
  const [s, set] = useCalcState('debtvsfd', {
    amount: 1000000, years: 7, fdRate: 7, debtRate: 7.5, slab: 30,
  });

  const r = useMemo(() => {
    const slab = s.slab / 100;

    // ── FD: interest is taxed EVERY year (on accrual / TDS) → only the
    // post-tax interest compounds. ──
    const fdPostTaxRate = s.fdRate / 100 * (1 - slab);
    const fdNet = s.amount * Math.pow(1 + fdPostTaxRate, s.years);

    // ── Debt fund: grows untaxed, slab tax applied ONCE on the full gain at
    // redemption (post-2023: no indexation, but the deferral still helps). ──
    const debtGross = s.amount * Math.pow(1 + s.debtRate / 100, s.years);
    const debtTax = (debtGross - s.amount) * slab;
    const debtNet = debtGross - debtTax;

    const data = [];
    for (let y = 1; y <= s.years; y++) {
      const fd = s.amount * Math.pow(1 + fdPostTaxRate, y);
      const dg = s.amount * Math.pow(1 + s.debtRate / 100, y);
      const dNet = dg - (dg - s.amount) * slab;
      data.push({ year: y, fd: Math.round(fd), debt: Math.round(dNet) });
    }
    return { fdNet, debtNet, gap: debtNet - fdNet, data };
  }, [s]);

  const debtWins = r.debtNet >= r.fdNet;

  return (
    <div className="space-y-4">
      <HeroCard
        label="Debt Fund vs Fixed Deposit — after tax"
        value={Math.abs(r.gap)}
        rawValue={`${debtWins ? 'Debt fund' : 'FD'} keeps ${formatINR(Math.abs(r.gap), true)} more`}
        gradient={debtWins ? 'emerald' : 'blue'}
        sub={debtWins
          ? `Both are slab-taxed now, but the debt fund defers tax to redemption — so more money compounds along the way`
          : `At these rates the FD edges ahead after tax`}
        meta={[
          { label: 'Debt fund (post-tax)', value: formatINR(r.debtNet, true) },
          { label: 'FD (post-tax)', value: formatINR(r.fdNet, true) },
          { label: 'Difference', value: formatINR(Math.abs(r.gap), true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Since April 2023, debt mutual funds lost indexation and are taxed at your <strong>slab</strong> — just like FD interest. So are they still worth it? Often yes, because of <strong>timing</strong>: an FD is taxed <strong>every year</strong> (via TDS/accrual), so only the after-tax interest compounds. A debt fund is taxed <strong>only when you redeem</strong>, so the full amount keeps compounding until then. Over {s.years} years that deferral leaves the debt fund <strong className={debtWins ? 'text-[#3EA23C]' : 'text-[#1E1963]'}>{formatINR(Math.abs(r.gap))}</strong> {debtWins ? 'ahead' : 'behind'} — plus it's far more liquid than a locked FD.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Comparison</p>
        <SliderInput label="Amount invested" value={s.amount} min={50000} max={50000000} step={50000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Holding period" value={s.years} min={1} max={20} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Your tax slab" value={s.slab} min={0} max={30} step={5} onChange={v => set({ slab: v })} unit="%" />
          <SliderInput label="FD interest rate" value={s.fdRate} min={4} max={9} step={0.25} onChange={v => set({ fdRate: v })} unit="%" />
          <SliderInput label="Debt fund return" hint="Typically tracks FD or slightly higher" value={s.debtRate} min={4} max={10} step={0.25} onChange={v => set({ debtRate: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Post-tax value over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />Debt fund</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />FD</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="dfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'debt' ? 'Debt fund' : 'FD']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="debt" stroke="#3EA23C" strokeWidth={2.5} fill="url(#dfGrad)" dot={false} />
            <Area type="monotone" dataKey="fd" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Which to pick</p>
        <p className="text-sm text-slate-700">
          For <strong>parking money 1–5 years</strong> with easy access, a debt fund (or arbitrage fund) usually beats an FD after tax and lets you withdraw anytime. Choose an <strong>FD</strong> for absolute capital certainty, deposit insurance up to ₹5L, or if you're in the 0% tax bracket where the deferral edge disappears.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'fdppf', label: 'FD / RD / PPF / NPS', desc: 'All safe options compared' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Debt vs equity, post-tax' },
        { id: 'realreturn', label: 'Real Return', desc: 'After tax AND inflation' },
      ]} />
    </div>
  );
}
