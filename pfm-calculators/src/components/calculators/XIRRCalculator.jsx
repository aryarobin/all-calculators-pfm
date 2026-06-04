import { useMemo } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcXIRR, calcCAGR, formatINR } from '../../utils/financialCalc';

// Default: a year of monthly SIPs + a final value
const DEFAULT_FLOWS = [
  { date: '2023-01-01', amount: -10000 },
  { date: '2023-04-01', amount: -10000 },
  { date: '2023-07-01', amount: -10000 },
  { date: '2023-10-01', amount: -10000 },
  { date: '2024-01-01', amount: -10000 },
  { date: '2025-06-01', amount: 68000 },
];

export default function XIRRCalculator({ onNavigate }) {
  const [s, set] = useCalcState('xirr', { flows: DEFAULT_FLOWS });
  const flows = s.flows;

  const { xirr, invested, returned, valid } = useMemo(() => {
    const parsed = flows
      .filter(f => f.date && !isNaN(f.amount) && f.amount !== 0)
      .map(f => ({ date: new Date(f.date), amount: Number(f.amount) }))
      .filter(f => !isNaN(f.date.getTime()))
      .sort((a, b) => a.date - b.date);
    const inv = parsed.filter(f => f.amount < 0).reduce((s, f) => s + -f.amount, 0);
    const ret = parsed.filter(f => f.amount > 0).reduce((s, f) => s + f.amount, 0);
    const hasOut = parsed.some(f => f.amount < 0);
    const hasIn = parsed.some(f => f.amount > 0);
    const x = (parsed.length >= 2 && hasOut && hasIn) ? calcXIRR(parsed) : null;
    return { xirr: x, invested: inv, returned: ret, valid: x != null && isFinite(x) };
  }, [flows]);

  const update = (i, key, val) => set({ flows: flows.map((f, j) => j === i ? { ...f, [key]: key === 'amount' ? val : val } : f) });
  const addRow = () => set({ flows: [...flows, { date: '', amount: '' }] });
  const removeRow = (i) => set({ flows: flows.filter((_, j) => j !== i) });

  const absReturn = invested > 0 ? ((returned - invested) / invested * 100) : 0;

  return (
    <div className="space-y-4">
      <HeroCard
        label="Your actual annualised return (XIRR)"
        value={valid ? Math.round(xirr * 10) / 10 : 0}
        rawValue={valid ? `${xirr.toFixed(1)}%` : 'Add flows'}
        gradient={valid && xirr >= 0 ? 'emerald' : 'slate'}
        sub={valid
          ? `XIRR accounts for the exact timing of every cashflow — the true return on irregular investments like SIPs`
          : `Enter your investments (negative) and withdrawals/current value (positive)`}
        meta={[
          { label: 'Total invested', value: formatINR(invested, true) },
          { label: 'Total returned', value: formatINR(returned, true) },
          { label: 'Absolute return', value: `${absReturn.toFixed(0)}%` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          <strong>XIRR</strong> is the right way to measure SIP or irregular-investment returns — unlike a simple CAGR, it weights each cashflow by <em>when</em> it happened. Enter money you put in as <strong className="text-rose-500">negative</strong> and money you took out (or today's value) as <strong className="text-emerald-600">positive</strong>.
        </p>
      </div>

      {/* Cashflow editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Cashflows</p>
          <button onClick={addRow} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800">
            <Plus size={14} /> Add row
          </button>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            <span>Date</span><span>Amount (− in / + out)</span><span></span>
          </div>
          {flows.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input type="date" value={f.date} onChange={e => update(i, 'date', e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="number" value={f.amount} onChange={e => update(i, 'amount', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="-10000"
                className={`border border-slate-200 rounded-lg px-2.5 py-2 text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-500 ${Number(f.amount) < 0 ? 'text-rose-600' : 'text-emerald-600'}`} />
              <button onClick={() => removeRow(i)} className="text-slate-300 hover:text-rose-500 p-1.5" aria-label="Remove">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-3">
          Tip: list each SIP instalment as a negative, and your latest portfolio value as one positive on today's date.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'cagr', label: 'CAGR Calculator', desc: 'For a single lump start & end value' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Project a regular SIP forward' },
        { id: 'compare', label: 'Compare Instruments', desc: 'Benchmark your XIRR' },
      ]} />
    </div>
  );
}
