import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, calcLumpsum, formatINR } from '../../utils/financialCalc';

export default function SIPLumpsumCombo({ onNavigate }) {
  const [s, set] = useCalcState('siplumpsum', {
    lumpsum: 500000, monthly: 20000, years: 15, returnPct: 12, stepUp: 0,
  });

  const r = useMemo(() => {
    const lumpsumFV = calcLumpsum(s.lumpsum, s.returnPct, s.years).corpus;

    // SIP with optional annual step-up
    const rM = s.returnPct / 100 / 12;
    const step = s.stepUp / 100;
    let sipCorpus = 0, sipInvested = 0, m = s.monthly;
    for (let y = 1; y <= s.years; y++) {
      for (let k = 0; k < 12; k++) { sipCorpus = (sipCorpus + m) * (1 + rM); sipInvested += m; }
      m *= (1 + step);
    }

    const total = lumpsumFV + sipCorpus;
    const invested = s.lumpsum + sipInvested;
    const gains = total - invested;

    const data = [];
    let c = 0, mm = s.monthly, inv = s.lumpsum;
    for (let y = 1; y <= s.years; y++) {
      for (let k = 0; k < 12; k++) { c = (c + mm) * (1 + rM); inv += mm; }
      const lump = calcLumpsum(s.lumpsum, s.returnPct, y).corpus;
      data.push({ year: y, total: Math.round(lump + c), invested: Math.round(inv) });
      mm *= (1 + step);
    }
    return { lumpsumFV, sipCorpus, total, invested, gains, data };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`A ${formatINR(s.lumpsum)} head-start plus ${formatINR(s.monthly)}/mo`}
        value={r.total}
        gradient="blue"
        sub={`Combining a one-time lumpsum with a monthly SIP over ${s.years} years — invested ${formatINR(r.invested, true)}, gained ${formatINR(r.gains, true)}`}
        meta={[
          { label: 'From lumpsum', value: formatINR(r.lumpsumFV, true) },
          { label: 'From SIP', value: formatINR(r.sipCorpus, true) },
          { label: 'Total corpus', value: formatINR(r.total, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Most investors have both — some money to invest today and an amount they can add monthly. Putting <strong>{formatINR(s.lumpsum)}</strong> in now and <strong>{formatINR(s.monthly)}/mo</strong>{s.stepUp > 0 ? <> (stepped up {s.stepUp}% a year)</> : ''} at <strong>{s.returnPct}%</strong> grows to <strong className="text-[#1E1963]">{formatINR(r.total)}</strong> in {s.years} years. The lumpsum does the heavy lifting early (more time to compound), while the SIP steadily adds and averages your cost.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Plan</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="One-time lumpsum (now)" value={s.lumpsum} min={0} max={50000000} step={50000} onChange={v => set({ lumpsum: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="Monthly SIP" value={s.monthly} min={0} max={500000} step={1000} onChange={v => set({ monthly: v })} prefix="₹" hint="Tap to type" />
          <SliderInput label="Duration" value={s.years} min={1} max={40} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Expected return" value={s.returnPct} min={4} max={18} step={0.5} onChange={v => set({ returnPct: v })} unit="%" />
          <SliderInput label="Annual SIP step-up" hint="Raise the SIP each year" value={s.stepUp} min={0} max={15} step={0.5} onChange={v => set({ stepUp: v })} unit="%" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm font-bold text-slate-800">Combined growth over {s.years} years</p>
          <div className="flex gap-4 text-[11px] text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-[#1E1963] inline-block" />Corpus</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-full bg-slate-300 inline-block" />Invested</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={r.data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="slGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1E1963" stopOpacity={0.25} />
                <stop offset="90%" stopColor="#1E1963" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v}y`} axisLine={false} tickLine={false} interval={Math.max(1, Math.floor(s.years / 8))} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => formatINR(v, true)} width={68} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v, n) => [formatINR(v), n === 'total' ? 'Corpus' : 'Invested']} labelFormatter={l => `Year ${l}`} />
            <Area type="monotone" dataKey="total" stroke="#1E1963" strokeWidth={2.5} fill="url(#slGrad)" dot={false} />
            <Area type="monotone" dataKey="invested" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'sip', label: 'SIP Calculator', desc: 'Just the monthly part' },
        { id: 'lumpvssip', label: 'Lumpsum vs SIP', desc: 'All-in now or stagger it?' },
        { id: 'stepup', label: 'Step-Up SIP', desc: 'Grow the SIP every year' },
      ]} />
    </div>
  );
}
