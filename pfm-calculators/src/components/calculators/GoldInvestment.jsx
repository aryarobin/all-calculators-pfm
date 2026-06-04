import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

export default function GoldInvestment({ onNavigate }) {
  const [s, set] = useCalcState('goldinvest', {
    amount: 500000, years: 8, goldReturn: 9,
    sgbInterest: 2.5, etfExpense: 0.5, makingCharge: 8, slab: 30,
  });

  const r = useMemo(() => {
    const g = s.goldReturn / 100;
    const grow = Math.pow(1 + g, s.years);

    // ── SGB: price appreciation + 2.5% annual interest, LTCG tax-FREE at maturity ──
    const sgbPrice = s.amount * grow;
    // 2.5% simple interest each year on face value, credited semi-annually (interest is taxable at slab)
    const sgbInterestTotal = s.amount * (s.sgbInterest / 100) * s.years * (1 - s.slab / 100);
    const sgb = sgbPrice + sgbInterestTotal; // capital gain exempt if held to maturity

    // ── Gold ETF: appreciation minus annual expense ratio, LTCG 12.5% on gains ──
    const etfNet = Math.pow(1 + g - s.etfExpense / 100, s.years);
    const etfGross = s.amount * etfNet;
    const etfGain = Math.max(0, etfGross - s.amount);
    const etf = etfGross - etfGain * 0.125;

    // ── Physical gold: lose making charges upfront, gains taxed at 12.5% LTCG ──
    const effective = s.amount * (1 - s.makingCharge / 100); // making charges sunk
    const physGross = effective * grow;
    const physGain = Math.max(0, physGross - s.amount);
    const phys = physGross - physGain * 0.125;

    const bars = [
      { name: 'SGB', value: Math.round(sgb), color: '#1E1963', note: '+2.5% interest, tax-free gains' },
      { name: 'Gold ETF', value: Math.round(etf), color: '#CA8D1B', note: 'expense ratio drag' },
      { name: 'Physical', value: Math.round(phys), color: '#94a3b8', note: 'making charges lost' },
    ].sort((a, b) => b.value - a.value);

    const best = bars[0];
    const worst = bars[bars.length - 1];
    return { sgb, etf, phys, sgbInterestTotal, bars, best, gap: best.value - worst.value };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Investing ${formatINR(s.amount)} in gold for ${s.years} years`}
        value={r.best.value}
        rawValue={`${r.best.name} wins — ${formatINR(r.best.value, true)}`}
        gradient="amber"
        sub={`${r.best.name} ends ${formatINR(r.gap, true)} ahead of the worst option — the wrapper you choose matters as much as gold's price`}
        meta={[
          { label: 'SGB', value: formatINR(r.sgb, true) },
          { label: 'Gold ETF', value: formatINR(r.etf, true) },
          { label: 'Physical', value: formatINR(r.phys, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Same gold price, three very different outcomes. <strong>Sovereign Gold Bonds</strong> pay an extra <strong>2.5%/yr</strong> interest and their capital gains are <strong>fully tax-free if held to maturity</strong> — the clear winner for an 8-year horizon. <strong>Gold ETFs</strong> are liquid but lose ~<strong>{s.etfExpense}%/yr</strong> to expenses and pay LTCG. <strong>Physical gold</strong> bleeds <strong>{s.makingCharge}%</strong> to making charges plus storage and purity loss on resale — worst for pure investment.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Gold Plan</p>
        <SliderInput label="Amount to invest" value={s.amount} min={50000} max={10000000} step={50000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Holding period" hint="SGB matures at 8 years" value={s.years} min={1} max={20} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Expected gold price return" value={s.goldReturn} min={4} max={15} step={0.5} onChange={v => set({ goldReturn: v })} unit="%" />
          <SliderInput label="ETF expense ratio" value={s.etfExpense} min={0.1} max={1} step={0.05} onChange={v => set({ etfExpense: v })} unit="%" />
          <SliderInput label="Physical making charge" hint="Jewellery 8–25%, coins 2–5%" value={s.makingCharge} min={0} max={25} step={1} onChange={v => set({ makingCharge: v })} unit="%" />
          <SliderInput label="Your tax slab" hint="For SGB interest" value={s.slab} min={0} max={30} step={5} onChange={v => set({ slab: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-4">Maturity value by route</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={r.bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={v => [formatINR(v), 'Maturity value']} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={80}>
              {r.bars.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">Practical note</p>
        <p className="text-sm text-slate-700">
          For <strong>investment</strong>, prefer SGB (if you can hold 8 years) or Gold ETFs for liquidity. Buy <strong>physical gold only for use</strong> — jewellery and weddings — not as an investment. And keep gold to <strong>5–10% of your portfolio</strong>; it's a hedge, not a wealth-builder.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'compare', label: 'Compare Instruments', desc: 'Gold vs equity, FD, PPF' },
        { id: 'capgains', label: 'Capital Gains Tax', desc: 'Tax on gold gains' },
        { id: 'networth', label: 'Net Worth Tracker', desc: 'How much gold should you hold?' },
      ]} />
    </div>
  );
}
