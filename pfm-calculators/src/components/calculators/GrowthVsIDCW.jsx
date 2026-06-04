import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const EQ_LTCG = 0.125;       // 12.5% equity LTCG
const EQ_EXEMPT = 125000;    // ₹1.25L annual LTCG exemption

export default function GrowthVsIDCW({ onNavigate }) {
  const [s, set] = useCalcState('growthidcw', {
    amount: 1000000, years: 15, returnPct: 12, payoutPct: 6, slab: 30,
  });

  const r = useMemo(() => {
    const r0 = s.returnPct / 100;
    const d = s.payoutPct / 100;
    const slab = s.slab / 100;

    // ── GROWTH: nothing distributed; everything compounds, taxed once at exit ──
    const growthGross = s.amount * Math.pow(1 + r0, s.years);
    const growthGain = growthGross - s.amount;
    const growthTax = Math.max(0, growthGain - EQ_EXEMPT) * EQ_LTCG;
    const growthNet = growthGross - growthTax;

    // ── IDCW: each year the fund pays out d% of NAV as dividend, taxed at slab.
    // We reinvest the post-tax dividend so it's a fair value comparison.
    let val = s.amount;
    for (let y = 1; y <= s.years; y++) {
      val *= (1 + r0);                 // total return for the year
      const dividend = val * d;        // distributed out of NAV
      const tax = dividend * slab;     // taxed at your slab, every year
      val -= tax;                      // dividend reinvested net of tax (NAV drops by the tax leak)
    }
    // Remaining embedded gains still attract LTCG at redemption
    const idcwGain = val - s.amount;
    const idcwExitTax = Math.max(0, idcwGain - EQ_EXEMPT) * EQ_LTCG;
    const idcwNet = val - idcwExitTax;

    const data = [];
    let gv = s.amount, iv = s.amount;
    for (let y = 1; y <= s.years; y++) {
      gv = s.amount * Math.pow(1 + r0, y);
      iv *= (1 + r0); const dv = iv * d; iv -= dv * slab;
      data.push({ year: y, growth: Math.round(gv), idcw: Math.round(iv) });
    }
    return { growthNet, idcwNet, growthTax, gap: growthNet - idcwNet, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Growth vs IDCW (Dividend) — after tax"
        value={r.gap}
        rawValue={`Growth keeps ${formatINR(r.gap, true)} more`}
        gradient="emerald"
        sub={`The dividend option leaks tax at your ${s.slab}% slab every year; growth defers everything to a single 12.5% LTCG`}
        meta={[
          { label: 'Growth (post-tax)', value: formatINR(r.growthNet, true) },
          { label: 'IDCW (post-tax)', value: formatINR(r.idcwNet, true) },
          { label: 'Growth advantage', value: formatINR(r.gap, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Same fund, two options. <strong>Growth</strong> reinvests everything — you pay tax only once, at redemption, as <strong>12.5% LTCG</strong> (with a ₹1.25L yearly exemption). <strong>IDCW</strong> (the old "dividend" option) pays out ~{s.payoutPct}% of NAV each year, and that payout is taxed at your full <strong>{s.slab}% slab</strong> — a leak that repeats annually and never gets to compound. Over {s.years} years that's a <strong className="text-[#3EA23C]">{formatINR(r.gap)}</strong> difference. For wealth-building, Growth almost always wins.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Investment</p>
        <SliderInput label="Amount invested" value={s.amount} min={50000} max={50000000} step={50000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Holding period" value={s.years} min={1} max={30} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Expected return" value={s.returnPct} min={6} max={18} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
          <SliderInput label="IDCW payout rate" hint="% of NAV paid out yearly" value={s.payoutPct} min={1} max={12} step={0.5} onChange={v => set({ payoutPct: v })} unit="%" />
          <SliderInput label="Your tax slab" value={s.slab} min={5} max={30} step={5} onChange={v => set({ slab: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Value growth: Growth vs IDCW</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />Growth</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />IDCW</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="giGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'growth' ? 'Growth' : 'IDCW']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="growth" stroke="#3EA23C" strokeWidth={2.5} fill="url(#giGrad)" dot={false} />
            <Area type="monotone" dataKey="idcw" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">When IDCW makes sense</p>
        <p className="text-sm text-slate-700">
          Only if you genuinely need a regular cash flow and can't manage withdrawals yourself. Even then, a <strong>Growth fund + SWP</strong> is usually more tax-efficient — you control the timing and only the gain portion of each withdrawal is taxed, not the whole payout.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'swp', label: 'SWP Calculator', desc: 'The tax-smart way to draw income' },
        { id: 'capgains', label: 'Capital Gains Tax', desc: 'LTCG on your redemption' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Build the growth corpus' },
      ]} />
    </div>
  );
}
