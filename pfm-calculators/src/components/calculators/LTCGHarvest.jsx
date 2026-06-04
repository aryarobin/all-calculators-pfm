import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const EQ_LTCG = 0.125;
const EQ_EXEMPT = 125000; // ₹1.25L equity LTCG exemption per year

export default function LTCGHarvest({ onNavigate }) {
  const [s, set] = useCalcState('ltcgharvest', {
    amount: 2000000, years: 12, returnPct: 12,
  });

  const r = useMemo(() => {
    const g = s.returnPct / 100;

    // ── No harvesting: tax the whole gain once at the end ──
    const finalValue = s.amount * Math.pow(1 + g, s.years);
    const plainTax = Math.max(0, (finalValue - s.amount) - EQ_EXEMPT) * EQ_LTCG;
    const plainNet = finalValue - plainTax;

    // ── Harvesting: each year realise up to ₹1.25L of gains tax-free and
    // rebuy, stepping up the cost basis. Value is unchanged (immediate rebuy). ──
    let value = s.amount, basis = s.amount, harvested = 0;
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      value *= (1 + g);
      const gain = value - basis;
      const harvest = Math.max(0, Math.min(EQ_EXEMPT, gain));
      basis += harvest;          // rebuy at a higher basis, no tax (within exemption)
      harvested += harvest;
      const taxIfSoldNow = Math.max(0, (value - basis) - EQ_EXEMPT) * EQ_LTCG;
      data.push({ year: y, value: Math.round(value), harvestedTax: Math.round(taxIfSoldNow), plainTax: Math.round(Math.max(0, (value - s.amount) - EQ_EXEMPT) * EQ_LTCG) });
    }
    const harvestFinalTax = Math.max(0, (value - basis) - EQ_EXEMPT) * EQ_LTCG;
    const harvestNet = value - harvestFinalTax;
    const taxSaved = plainNet < harvestNet ? harvestNet - plainNet : plainTax - harvestFinalTax;

    return { finalValue, plainTax, plainNet, harvestNet, harvestFinalTax, harvested, taxSaved, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Tax saved by harvesting LTCG every year"
        value={r.taxSaved}
        gradient="emerald"
        sub={`By booking up to ₹1.25L of gains tax-free each year and rebuying, you reset your cost basis higher — shrinking the tax at the end`}
        meta={[
          { label: 'Tax without harvesting', value: formatINR(r.plainTax, true) },
          { label: 'Tax with harvesting', value: formatINR(r.harvestFinalTax, true) },
          { label: 'You keep', value: `+${formatINR(r.taxSaved, true)}` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Equity LTCG up to <strong>₹1.25 lakh a year is tax-free</strong>. If you simply hold and sell at the end, one big gain gets taxed at 12.5% above that single exemption. But if you <strong>sell enough units each year to realise ₹1.25L of gains and immediately rebuy</strong>, you use the exemption every year and step up your cost basis — so the final taxable gain is far smaller. Over {s.years} years you harvest about <strong>{formatINR(r.harvested)}</strong> of gains tax-free and keep an extra <strong className="text-[#3EA23C]">{formatINR(r.taxSaved)}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Holding</p>
        <SliderInput label="Amount invested" value={s.amount} min={200000} max={50000000} step={100000} onChange={v => set({ amount: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Holding period" value={s.years} min={2} max={30} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Expected return" value={s.returnPct} min={6} max={18} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Tax due if sold each year</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />Harvested</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Not harvested</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="hvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.2} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={64} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'harvestedTax' ? 'With harvesting' : 'Without']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="harvestedTax" stroke="#3EA23C" strokeWidth={2.5} fill="url(#hvGrad)" dot={false} />
            <Area type="monotone" dataKey="plainTax" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">How to do it</p>
        <p className="text-sm text-slate-700">
          Near the end of each financial year, check your unrealised equity gains. Redeem enough units so the realised gain is around ₹1.25L, then rebuy the same fund the next day. Keep it under the exemption so there's no tax. Mind exit loads and the 1-year holding requirement for LTCG, and don't let tax-saving override your actual asset allocation.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'capgains', label: 'Capital Gains Tax', desc: 'The full LTCG/STCG picture' },
        { id: 'swp', label: 'SWP Calculator', desc: 'Tax-smart withdrawals' },
        { id: 'growthidcw', label: 'Growth vs IDCW', desc: 'The other big MF tax lever' },
      ]} />
    </div>
  );
}
