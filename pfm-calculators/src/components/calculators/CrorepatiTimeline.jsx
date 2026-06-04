import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, calcSIPFromCorpus, formatINR } from '../../utils/financialCalc';

// Months for a SIP (+ optional starting lumpsum) to reach a target.
function monthsToTarget(monthly, lumpsum, ratePct, target) {
  const r = ratePct / 100 / 12;
  let bal = lumpsum;
  for (let m = 1; m <= 1200; m++) {
    bal = bal * (1 + r) + monthly;
    if (bal >= target) return m;
  }
  return null;
}

const TARGETS = [
  { v: 10000000, l: '₹1 Crore' },
  { v: 50000000, l: '₹5 Crore' },
  { v: 100000000, l: '₹10 Crore' },
];

export default function CrorepatiTimeline({ onNavigate }) {
  const [s, set] = useCalcState('crorepati', {
    target: 10000000, monthly: 25000, lumpsum: 0, rate: 12,
  });

  const r = useMemo(() => {
    const months = monthsToTarget(s.monthly, s.lumpsum, s.rate, s.target);
    const years = months ? months / 12 : null;
    const sipForTen = calcSIPFromCorpus(Math.max(0, s.target - s.lumpsum * Math.pow(1 + s.rate / 100, 10)), s.rate, 10);
    // growth series until target (cap at found month + a little)
    const horizon = months ? Math.min(600, months + 12) : 480;
    const data = [];
    const rr = s.rate / 100 / 12;
    let bal = s.lumpsum;
    for (let m = 1; m <= horizon; m++) {
      bal = bal * (1 + rr) + s.monthly;
      if (m % 6 === 0 || m === months) data.push({ month: m, year: +(m / 12).toFixed(1), balance: Math.round(bal) });
    }
    return { months, years, sipForTen, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`Reaching ${formatINR(s.target)} with ${formatINR(s.monthly)}/mo at ${s.rate}%`}
        value={r.years ? Math.round(r.years * 10) / 10 : 0}
        rawValue={r.years ? `${r.years.toFixed(1)} years` : 'Increase SIP'}
        gradient="blue"
        sub={r.years
          ? `That's ${r.months} months of disciplined investing to hit your milestone`
          : `At this pace you won't reach the target in a lifetime — raise the SIP or return`}
        meta={[
          { label: 'Target', value: formatINR(s.target, true) },
          { label: 'Monthly SIP', value: formatINR(s.monthly) },
          { label: 'Or, in 10 yrs', value: `${formatINR(r.sipForTen)}/mo` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          {r.years
            ? <>Investing <strong>{formatINR(s.monthly)}/mo</strong>{s.lumpsum > 0 ? <> plus a <strong>{formatINR(s.lumpsum)}</strong> head-start</> : ''} at <strong>{s.rate}%</strong>, you'll cross <strong className="text-[#1E1963]">{formatINR(s.target)}</strong> in about <strong>{r.years.toFixed(1)} years</strong>. To get there in 10 years instead, you'd invest <strong>{formatINR(r.sipForTen)}/mo</strong>.</>
            : <>This pace is too slow to reach {formatINR(s.target)}. Raise your monthly SIP, add a lumpsum, or target a higher return.</>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Milestone</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {TARGETS.map(t => (
            <button key={t.v} onClick={() => set({ target: t.v })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${s.target === t.v ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {t.l}
            </button>
          ))}
        </div>
        <SliderInput label="Target amount" value={s.target} min={1000000} max={500000000} step={1000000} onChange={v => set({ target: v })} prefix="₹" hint="Tap to type any goal" />
        <SliderInput label="Monthly SIP" value={s.monthly} min={1000} max={1000000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Starting lumpsum (optional)" value={s.lumpsum} min={0} max={50000000} step={100000} onChange={v => set({ lumpsum: v })} prefix="₹" />
          <SliderInput label="Expected return" value={s.rate} min={6} max={20} step={0.5} onChange={v => set({ rate: v })} unit="%" />
        </div>
      </div>

      {r.years && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <p className="text-sm font-bold text-slate-800 mb-4">Journey to {formatINR(s.target, true)}</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="croreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E1963" stopOpacity={0.25} />
                  <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
              <Tooltip formatter={v => [formatINR(v), 'Corpus']} labelFormatter={l => `Year ${l}`} />
              <ReferenceLine y={s.target} stroke="#CA8D1B" strokeDasharray="4 4" label={{ value: 'Target', fill: '#CA8D1B', fontSize: 10, position: 'right' }} />
              <Area type="monotone" dataKey="balance" stroke="#1E1963" strokeWidth={2.5} fill="url(#croreGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'stepup', label: 'Step-Up SIP', desc: 'Reach it faster by raising SIP yearly' },
        { id: 'sip', label: 'SIP Calculator', desc: 'See the full corpus breakdown' },
        { id: 'fire', label: 'Financial Freedom', desc: 'Is ₹1 Cr enough to retire?' },
      ]} />
    </div>
  );
}
