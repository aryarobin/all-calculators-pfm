import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

const ASSETS = [
  { key: 'cash',    label: 'Cash & Savings', color: '#94a3b8' },
  { key: 'fd',      label: 'FD / RD',         color: '#334BA0' },
  { key: 'epf',     label: 'EPF / PPF',       color: '#3EA23C' },
  { key: 'mf',      label: 'Mutual Funds',    color: '#1E1963' },
  { key: 'stocks',  label: 'Stocks',          color: '#6366f1' },
  { key: 'gold',    label: 'Gold',            color: '#CA8D1B' },
  { key: 'realestate', label: 'Real Estate',  color: '#0d9488' },
  { key: 'other',   label: 'Other Assets',    color: '#64748b' },
];
const LIABILITIES = [
  { key: 'home', label: 'Home Loan' },
  { key: 'car',  label: 'Car Loan' },
  { key: 'personal', label: 'Personal Loan' },
  { key: 'card', label: 'Credit Card Debt' },
  { key: 'otherDebt', label: 'Other Debt' },
];

const DEFAULTS = {
  cash: 200000, fd: 500000, epf: 800000, mf: 1000000, stocks: 300000,
  gold: 400000, realestate: 5000000, other: 0,
  home: 3000000, car: 0, personal: 0, card: 0, otherDebt: 0,
};

const Row = ({ label, value, onChange, max, color }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-slate-600 flex items-center gap-2">
        {color && <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />}
        {label}
      </span>
      <span className="text-sm font-bold text-slate-800 tabular-nums">{formatINR(value)}</span>
    </div>
    <input type="range" min={0} max={max} step={25000} value={Math.min(value, max)}
      onChange={e => onChange(+e.target.value)} className="w-full"
      style={{ background: `linear-gradient(to right,${color || '#1E1963'} 0%,${color || '#1E1963'} ${Math.min(100, value / max * 100)}%,#e2e8f0 ${Math.min(100, value / max * 100)}%,#e2e8f0 100%)` }} />
  </div>
);

export default function NetWorth({ onNavigate }) {
  const [s, set] = useCalcState('networth', DEFAULTS);

  const { totalAssets, totalLiab, netWorth, pieData } = useMemo(() => {
    const ta = ASSETS.reduce((sum, a) => sum + (s[a.key] || 0), 0);
    const tl = LIABILITIES.reduce((sum, l) => sum + (s[l.key] || 0), 0);
    const pie = ASSETS.map(a => ({ name: a.label, value: s[a.key] || 0, color: a.color })).filter(d => d.value > 0);
    return { totalAssets: ta, totalLiab: tl, netWorth: ta - tl, pieData: pie };
  }, [s]);

  const debtRatio = totalAssets > 0 ? (totalLiab / totalAssets * 100) : 0;

  return (
    <div className="space-y-4">
      <HeroCard
        label="Your Net Worth"
        value={netWorth}
        gradient={netWorth >= 0 ? 'blue' : 'rose'}
        sub={netWorth >= 0 ? 'Total assets minus everything you owe' : 'You owe more than you own — focus on clearing debt'}
        meta={[
          { label: 'Total assets', value: formatINR(totalAssets, true) },
          { label: 'Total liabilities', value: formatINR(totalLiab, true) },
          { label: 'Debt ratio', value: `${debtRatio.toFixed(0)}%` },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Assets — what you own</p>
          {ASSETS.map(a => (
            <Row key={a.key} label={a.label} value={s[a.key] || 0} color={a.color}
              max={a.key === 'realestate' ? 100000000 : 20000000}
              onChange={v => set({ [a.key]: v })} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 px-5 py-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Liabilities — what you owe</p>
            {LIABILITIES.map(l => (
              <Row key={l.key} label={l.label} value={s[l.key] || 0} color="#E33434"
                max={l.key === 'home' ? 50000000 : 5000000}
                onChange={v => set({ [l.key]: v })} />
            ))}
          </div>

          {pieData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Asset allocation</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={65} paddingAngle={2}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={v => formatINR(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'readiness', label: 'Readiness Score', desc: 'Are these assets enough to retire?' },
        { id: 'fire', label: 'Financial Freedom', desc: 'Your FIRE number vs net worth' },
        { id: 'prepay', label: 'Prepay vs Invest', desc: 'Cut liabilities or grow assets?' },
      ]} />
    </div>
  );
}
