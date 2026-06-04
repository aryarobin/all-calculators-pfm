import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

export default function IndexVsActive({ onNavigate }) {
  const [s, set] = useCalcState('indexactive', {
    monthly: 25000, years: 20, market: 12, indexER: 0.2, activeER: 1.2, alpha: 0,
  });

  const r = useMemo(() => {
    const indexNet = s.market - s.indexER;            // index just tracks the market, minus a tiny fee
    const activeNet = s.market + s.alpha - s.activeER; // active = market + manager alpha − higher fee
    const hurdle = s.activeER - s.indexER;             // gross alpha needed just to tie the index
    const index = calcSIP(s.monthly, indexNet, s.years).corpus;
    const active = calcSIP(s.monthly, activeNet, s.years).corpus;
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      data.push({
        year: y,
        index: Math.round(calcSIP(s.monthly, indexNet, y).corpus),
        active: Math.round(calcSIP(s.monthly, activeNet, y).corpus),
      });
    }
    return { indexNet, activeNet, hurdle, index, active, gap: index - active, data };
  }, [s]);

  const indexWins = r.index >= r.active;

  return (
    <div className="space-y-4">
      <HeroCard
        label={indexWins ? 'The fee hurdle your active fund must clear' : 'Your active fund is earning its fee'}
        value={Math.abs(r.gap)}
        rawValue={`${indexWins ? 'Index' : 'Active'} ends ${formatINR(Math.abs(r.gap), true)} ahead`}
        gradient={indexWins ? 'blue' : 'emerald'}
        sub={indexWins
          ? `To beat the index, your fund must out-pick it by ${r.hurdle.toFixed(1)}% every year — it's currently adding ${s.alpha.toFixed(1)}%`
          : `At ${s.alpha.toFixed(1)}% annual outperformance, this fund justifies its higher fee`}
        meta={[
          { label: 'Index fund corpus', value: formatINR(r.index, true) },
          { label: 'Active fund corpus', value: formatINR(r.active, true) },
          { label: 'Alpha needed to tie', value: `${r.hurdle.toFixed(1)}%/yr` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          An index fund quietly tracks the market for a <strong>{s.indexER}%</strong> fee. An active fund charges <strong>{s.activeER}%</strong> — so its manager must generate <strong className="text-[#1E1963]">{r.hurdle.toFixed(1)}% of extra return every single year</strong> just to match the index after costs. Drag the outperformance slider: at <strong>{s.alpha.toFixed(1)}%</strong> alpha, the active fund {indexWins ? <>still trails by <strong className="text-[#1E1963]">{formatINR(r.gap)}</strong> over {s.years} years</> : <>wins by <strong className="text-[#3EA23C]">{formatINR(Math.abs(r.gap))}</strong></>}. The catch: most active funds don't beat their index consistently over the long run.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Comparison</p>
        <SliderInput label="Monthly SIP" value={s.monthly} min={1000} max={500000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Duration" value={s.years} min={3} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Market (gross) return" value={s.market} min={6} max={18} step={0.5} onChange={v => set({ market: v })} unit="%" />
          <SliderInput label="Active fund's alpha" hint="Yearly out-performance vs index" value={s.alpha} min={-3} max={5} step={0.25} onChange={v => set({ alpha: v })} unit="%" />
          <SliderInput label="Index fund expense ratio" value={s.indexER} min={0.05} max={1} step={0.05} onChange={v => set({ indexER: v })} unit="%" />
          <SliderInput label="Active fund expense ratio" value={s.activeER} min={0.3} max={2.5} step={0.05} onChange={v => set({ activeER: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Index vs Active over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Index</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />Active</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="iaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.22} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'index' ? 'Index' : 'Active']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="index" stroke="#1E1963" strokeWidth={2.5} fill="url(#iaGrad)" dot={false} />
            <Area type="monotone" dataKey="active" stroke="#3EA23C" strokeWidth={2} strokeDasharray="5 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The honest takeaway</p>
        <p className="text-sm text-slate-700">
          Over 10+ years, the majority of large-cap active funds in India fail to beat their benchmark after fees. A low-cost index fund is the safe default for core equity. Use active funds only where you have real conviction the manager can sustain alpha — usually mid/small-cap or thematic.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'directregular', label: 'Direct vs Regular MF', desc: 'Another fee you can cut' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Project your index SIP' },
        { id: 'xirr', label: 'XIRR Calculator', desc: 'Your fund\'s real return' },
      ]} />
    </div>
  );
}
