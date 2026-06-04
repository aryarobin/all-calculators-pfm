import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

// Grow a monthly contribution with an annual step-up (salary hike) at a fixed rate.
function growContribution(monthly, ratePct, years, stepUpPct) {
  const r = ratePct / 100 / 12;
  const step = stepUpPct / 100;
  let corpus = 0, invested = 0, m = monthly;
  for (let y = 1; y <= years; y++) {
    for (let k = 0; k < 12; k++) { corpus = (corpus + m) * (1 + r); invested += m; }
    m *= (1 + step);
  }
  return { corpus, invested };
}

export default function EPFvsNPSvsVPF({ onNavigate }) {
  const [s, set] = useCalcState('epfnpsvpf', {
    monthly: 15000, years: 25, stepUp: 5,
    epfRate: 8.25, npsRate: 10, taxSlab: 30,
  });

  const r = useMemo(() => {
    // EPF / VPF earn the same fixed EEE rate — fully tax-free at withdrawal.
    const epf = growContribution(s.monthly, s.epfRate, s.years, s.stepUp);
    // NPS is market-linked. At exit, 60% is tax-free lumpsum; 40% buys an
    // annuity (taxable as income later). We show post-tax-equivalent value:
    // 60% fully usable + 40% discounted by the eventual pension tax drag.
    const nps = growContribution(s.monthly, s.npsRate, s.years, s.stepUp);
    const npsUsable = nps.corpus * 0.6 + nps.corpus * 0.4 * (1 - s.taxSlab / 100 * 0.5);
    // NPS also gives an extra ₹50k/yr 80CCD(1B) deduction → annual tax saved.
    const npsTaxSaved = Math.min(s.monthly * 12, 50000) * (s.taxSlab / 100);

    const bars = [
      { name: 'EPF / VPF', value: Math.round(epf.corpus), usable: Math.round(epf.corpus), color: '#1E1963' },
      { name: 'NPS', value: Math.round(nps.corpus), usable: Math.round(npsUsable), color: '#3EA23C' },
    ];
    const best = npsUsable >= epf.corpus ? 'NPS' : 'EPF/VPF';
    return { epf, nps, npsUsable, npsTaxSaved, bars, best, diff: Math.abs(npsUsable - epf.corpus) };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`${formatINR(s.monthly)}/mo for ${s.years} years — where it grows most`}
        value={r.diff}
        rawValue={`${r.best} ends ${formatINR(r.diff, true)} ahead`}
        gradient={r.best === 'NPS' ? 'emerald' : 'blue'}
        sub={r.best === 'NPS'
          ? `NPS's market-linked returns win over the long run, even after the annuity tax — plus an extra ₹50k tax break`
          : `EPF/VPF's guaranteed tax-free ${s.epfRate}% is hard to beat at this horizon`}
        meta={[
          { label: 'EPF / VPF (tax-free)', value: formatINR(r.epf.corpus, true) },
          { label: 'NPS (gross)', value: formatINR(r.nps.corpus, true) },
          { label: 'NPS post-tax usable', value: formatINR(r.npsUsable, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          <strong>EPF & VPF</strong> pay a guaranteed <strong>{s.epfRate}%</strong>, fully tax-free (EEE) — VPF lets you voluntarily add beyond the mandatory 12%. <strong>NPS</strong> is market-linked (assumed <strong>{s.npsRate}%</strong>): at 60 you get 60% as a tax-free lumpsum, and 40% must buy an annuity that's taxed as pension. NPS also gives an extra <strong>{formatINR(r.npsTaxSaved)}/yr</strong> tax saving under 80CCD(1B). Higher growth potential, less liquidity, partial tax at exit.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Contribution</p>
        <SliderInput label="Monthly contribution" value={s.monthly} min={1000} max={150000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Years to retirement" value={s.years} min={5} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Annual salary hike" hint="Contribution grows with it" value={s.stepUp} min={0} max={15} step={0.5} onChange={v => set({ stepUp: v })} unit="%" />
          <SliderInput label="EPF / VPF rate" value={s.epfRate} min={7} max={9} step={0.05} onChange={v => set({ epfRate: v })} unit="%" />
          <SliderInput label="Expected NPS return" hint="Equity-tilted, long-term" value={s.npsRate} min={7} max={14} step={0.5} onChange={v => set({ npsRate: v })} unit="%" />
          <SliderInput label="Your tax slab" value={s.taxSlab} min={0} max={30} step={5} onChange={v => set({ taxSlab: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Corpus at retirement</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Gross</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Post-tax usable</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={r.bars} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'value' ? 'Gross corpus' : 'Post-tax usable']} cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={70}>
              {r.bars.map((b, i) => <Cell key={i} fill={b.color} />)}
            </Bar>
            <Bar dataKey="usable" radius={[6, 6, 0, 0]} maxBarSize={70} fill="#cbd5e1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The usual answer</p>
        <p className="text-sm text-slate-700">
          Most salaried Indians do best with a <strong>blend</strong>: keep mandatory EPF, add <strong>VPF</strong> for guaranteed tax-free returns, and put <strong>₹50k/yr into NPS</strong> purely for the extra 80CCD(1B) deduction. For the rest, a plain equity index fund often beats all three on flexibility — no lock-in to 60.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'fdppf', label: 'FD / RD / PPF / NPS', desc: 'Maturity for each scheme' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Is this enough to retire?' },
        { id: 'compare', label: 'Compare Instruments', desc: 'EPF vs MF vs NPS post-tax' },
      ]} />
    </div>
  );
}
