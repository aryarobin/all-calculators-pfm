import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, TrendingUp } from 'lucide-react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Future value of a yearly deposit (annuity-due, deposited at start of year)
function fvAnnuity(yearly, ratePct, years) {
  const r = ratePct / 100;
  if (r === 0) return yearly * years;
  return yearly * ((Math.pow(1 + r, years) - 1) / r) * (1 + r);
}

const TRAD_TYPES = {
  endowment: { label: 'LIC Endowment', ret: 5,   note: 'Guaranteed + bonus plans typically return ~4–6%.' },
  moneyback: { label: 'Money-Back',    ret: 5,   note: 'Periodic payouts; effective return similar to endowment.' },
  ulip:      { label: 'ULIP',          ret: 8,   note: 'Market-linked but dragged by mortality & admin charges.' },
};

export default function InsuranceVsInvestment({ onNavigate }) {
  const [s, set] = useCalcState('insurevsinvest', {
    tradType: 'endowment',
    annualPremium: 100000, years: 20,
    tradReturn: 5,             // editable; preset per bundled-plan type
    tradCover: 1000000,        // sum assured from the bundled plan (usually low)
    termPremium: 15000,        // pure term plan premium
    termCover: 10000000,       // ₹1 Cr term cover
    equityReturn: 12,
  });

  const trad = TRAD_TYPES[s.tradType];

  const r = useMemo(() => {
    const tradMaturity = fvAnnuity(s.annualPremium, s.tradReturn, s.years);
    const investable = Math.max(0, s.annualPremium - s.termPremium);
    const btidCorpus = fvAnnuity(investable, s.equityReturn, s.years);
    const data = [];
    for (let y = 1; y <= s.years; y++) {
      data.push({
        year: y,
        traditional: Math.round(fvAnnuity(s.annualPremium, s.tradReturn, y)),
        btid: Math.round(fvAnnuity(investable, s.equityReturn, y)),
      });
    }
    return { tradMaturity, btidCorpus, investable, extra: btidCorpus - tradMaturity, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label="Buy Term + Invest the rest vs a bundled plan"
        value={r.extra}
        gradient="emerald"
        sub={`Extra wealth from separating insurance and investment — over ${s.years} years`}
        meta={[
          { label: `${trad.label} maturity`, value: formatINR(r.tradMaturity, true) },
          { label: 'Term + Invest corpus', value: formatINR(r.btidCorpus, true) },
          { label: 'Life cover', value: `${formatINR(s.termCover, true)} vs ${formatINR(s.tradCover, true)}` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          A <strong>{trad.label}</strong> mixes insurance and investment — you pay <strong>{formatINR(s.annualPremium)}/yr</strong> for a small <strong>{formatINR(s.tradCover)}</strong> cover and ~{s.tradReturn}% returns. Instead, a pure <strong>term plan</strong> gives a far larger <strong>{formatINR(s.termCover)}</strong> cover for just <strong>{formatINR(s.termPremium)}/yr</strong> — and you invest the remaining <strong className="text-[#3EA23C]">{formatINR(r.investable)}/yr</strong> in equity. Result: <strong className="text-[#3EA23C]">{formatINR(r.extra)} more</strong> AND {formatINR(s.termCover / s.tradCover)}× the protection.
        </p>
      </div>

      {/* Two-path comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-slate-400" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{trad.label} (bundled)</p>
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.tradMaturity, true)}</p>
          <p className="text-xs text-slate-500 mt-1">maturity · {formatINR(s.tradCover, true)} cover · ~{s.tradReturn}%</p>
        </div>
        <div className="rounded-2xl border-2 border-[#3EA23C] bg-[#3EA23C]/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-[#3EA23C]" />
            <p className="text-xs font-bold text-[#3EA23C] uppercase tracking-wider">Term + Invest</p>
          </div>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.btidCorpus, true)}</p>
          <p className="text-xs text-slate-500 mt-1">corpus · {formatINR(s.termCover, true)} cover · {s.equityReturn}%</p>
          <p className="text-xs font-bold text-[#3EA23C] mt-1.5">✓ More wealth + more protection</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">The bundled plan you're comparing</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(TRAD_TYPES).map(([key, v]) => (
            <button key={key} onClick={() => set({ tradType: key, tradReturn: v.ret })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-semibold transition-all ${s.tradType === key ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {v.label}
            </button>
          ))}
        </div>
        <SliderInput label="Annual premium you'd pay" value={s.annualPremium} min={10000} max={1000000} step={5000} onChange={v => set({ annualPremium: v })} prefix="₹" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Policy term" value={s.years} min={5} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label={`${trad.label} return`} hint={trad.note} value={s.tradReturn} min={3} max={10} step={0.5} onChange={v => set({ tradReturn: v })} unit="%" />
          <SliderInput label="Bundled-plan cover (sum assured)" value={s.tradCover} min={100000} max={20000000} step={100000} onChange={v => set({ tradCover: v })} prefix="₹" />
          <SliderInput label="Equity MF return (invest side)" value={s.equityReturn} min={6} max={18} step={0.5} onChange={v => set({ equityReturn: v })} unit="%" />
        </div>
        <div className="pt-2 mt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Pure term plan premium" hint="~₹12–18k/yr for ₹1Cr at 30–35 yrs" value={s.termPremium} min={3000} max={100000} step={1000} onChange={v => set({ termPremium: v })} prefix="₹" />
          <SliderInput label="Term plan cover" value={s.termCover} min={1000000} max={50000000} step={1000000} onChange={v => set({ termCover: v })} prefix="₹" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Wealth built over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#3EA23C] inline-block" />Term + Invest</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />{trad.label}</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="btidGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3EA23C" stopOpacity={0.28} />
                <stop offset="90%" stopColor="#3EA23C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'btid' ? 'Term + Invest' : trad.label]} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="btid" stroke="#3EA23C" strokeWidth={2.5} fill="url(#btidGrad)" dot={false} />
            <Area type="monotone" dataKey="traditional" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The principle</p>
        <p className="text-sm text-slate-700">
          Insurance and investment solve different problems. Insurance replaces your income if you die; investment grows your wealth. Bundling them (endowment/ULIP/money-back) gives you <em>too little cover</em> and <em>too little return</em>. Buy a large term cover cheaply, and invest the rest separately — you win on both.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Grow the "invest the rest" part' },
        { id: 'fire', label: 'Financial Freedom', desc: 'How much cover/corpus you need' },
        { id: 'goal', label: 'Goal Planner', desc: 'Plan goals the bundled plan can\'t' },
      ]} />
    </div>
  );
}
