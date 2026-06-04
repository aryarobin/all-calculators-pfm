import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { formatINR } from '../../utils/financialCalc';

// Post-tax nominal return for each instrument, given the user's slab.
// Equity LTCG is 12.5% on gains over ₹1.25L/yr — with the exemption and the
// fact that withdrawals are part principal, the effective drag is ~8-10%.
function instruments(slab) {
  return [
    { key: 'fd',     label: 'Bank FD',        rate: 7,    color: '#3b82f6', tax: 'slab',   postTax: 7   * (1 - slab / 100) },
    { key: 'debt',   label: 'Debt MF',        rate: 7.5,  color: '#06b6d4', tax: 'slab',   postTax: 7.5 * (1 - slab / 100) },
    { key: 'hybrid', label: 'Hybrid / Balanced', rate: 10, color: '#8b5cf6', tax: 'ltcg', postTax: 10  * (1 - 0.10) },
    { key: 'equity', label: 'Index / Equity MF', rate: 12, color: '#f97316', tax: 'ltcg', postTax: 12  * (1 - 0.09) },
  ];
}

// Corpus to fund an inflation-growing expense forever (real perpetuity).
// real = (1+postTax)/(1+infl) - 1 ; corpus = annualExpense / real.
function freedomCorpus(annualExpense, postTaxReturn, inflation) {
  const real = (1 + postTaxReturn / 100) / (1 + inflation / 100) - 1;
  if (real <= 0) return { corpus: Infinity, real };
  return { corpus: annualExpense / real, real: real * 100 };
}

export default function FinancialFreedom({ onNavigate }) {
  const [s, set] = useCalcState('fire', {
    monthlyExpense: 200000, inflation: 6, slab: 30, primary: 'equity',
  });

  const annualExpense = s.monthlyExpense * 12;
  const list = useMemo(() => instruments(s.slab).map(inst => {
    const { corpus, real } = freedomCorpus(annualExpense, inst.postTax, s.inflation);
    return { ...inst, corpus, real, sustainable: real > 0 };
  }), [annualExpense, s.slab, s.inflation]);

  const primary = list.find(i => i.key === s.primary) || list[list.length - 1];
  const fdCorpus = list.find(i => i.key === 'fd');
  const savingVsFd = (fdCorpus && isFinite(fdCorpus.corpus) && isFinite(primary.corpus))
    ? fdCorpus.corpus - primary.corpus : null;

  const chartData = list.filter(i => isFinite(i.corpus));
  const maxCorpus = Math.max(...chartData.map(i => i.corpus), 1);

  return (
    <div className="space-y-4">

      {/* Hero — corpus to be free today via the chosen instrument */}
      <HeroCard
        label={`Retire today on ${formatINR(s.monthlyExpense)}/mo · via ${primary.label}`}
        value={isFinite(primary.corpus) ? primary.corpus : 0}
        rawValue={isFinite(primary.corpus) ? undefined : 'Not possible'}
        gradient={primary.key === 'equity' ? 'amber' : primary.key === 'fd' ? 'blue' : 'violet'}
        sub={isFinite(primary.corpus)
          ? `Live off returns forever — corpus grows with inflation, never depletes`
          : `${primary.label} after tax barely beats inflation — you can't live off it forever`}
        meta={[
          { label: 'Annual expense', value: formatINR(annualExpense, true) },
          { label: 'Post-tax return', value: `${primary.postTax.toFixed(1)}%` },
          { label: 'Real return', value: `${primary.real > 0 ? primary.real.toFixed(1) : '≤0'}%` },
        ]}
      />

      {/* The headline insight: FD vs chosen */}
      {savingVsFd != null && savingVsFd > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-600">
            Because FD interest is taxed at your <strong>{s.slab}%</strong> slab and barely beats {s.inflation}% inflation, a pure-FD freedom corpus is <strong className="text-slate-900">{isFinite(fdCorpus.corpus) ? formatINR(fdCorpus.corpus) : 'effectively infinite'}</strong>. Using <strong>{primary.label}</strong> instead, you need <strong className="text-emerald-700">{formatINR(primary.corpus)}</strong> — about <strong className="text-emerald-700">{formatINR(savingVsFd)} less</strong>.
          </p>
        </div>
      )}

      {/* Inputs */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Your Situation</p>
        <SliderInput label="Monthly expenses today" hint="What your lifestyle costs now · tap to type" value={s.monthlyExpense} min={20000} max={2000000} step={5000} onChange={v => set({ monthlyExpense: v })} prefix="₹" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Expected inflation" hint="Your expenses grow at this rate" value={s.inflation} min={3} max={10} step={0.5} onChange={v => set({ inflation: v })} unit="%" />
          <SliderInput label="Your income tax slab" hint="Used for FD / debt interest tax" value={s.slab} min={0} max={30} step={5} onChange={v => set({ slab: v })} unit="%" />
        </div>
        <p className="text-xs font-semibold text-slate-500 mb-2 mt-1">Where will you park the corpus?</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {list.map(inst => (
            <button key={inst.key} onClick={() => set({ primary: inst.key })}
              className={`px-3 py-2.5 rounded-xl border-2 text-left transition-all ${s.primary === inst.key ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
              <p className="text-xs font-bold text-slate-700">{inst.label}</p>
              <p className="text-[11px] text-slate-400">{inst.rate}% · {inst.tax === 'slab' ? 'slab tax' : 'LTCG'}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison: corpus needed per instrument */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <p className="text-sm font-bold text-slate-800 mb-1">Freedom corpus by where you invest it</p>
        <p className="text-xs text-slate-400 mb-4">Lower is better — tax-efficient, higher-return instruments need a smaller corpus</p>
        <div className="space-y-2">
          {list.map(inst => (
            <div key={inst.key} className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-600 w-28 flex-shrink-0">{inst.label}</span>
              <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden relative">
                {isFinite(inst.corpus) ? (
                  <div className="h-full rounded-lg flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${Math.max(12, inst.corpus / maxCorpus * 100)}%`, background: inst.color }}>
                    <span className="text-[11px] font-bold text-white tabular-nums">{formatINR(inst.corpus, true)}</span>
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center pl-2">
                    <span className="text-[11px] font-bold text-rose-500">Can't sustain — real return ≤ 0</span>
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-400 w-20 text-right flex-shrink-0">{inst.postTax.toFixed(1)}% post-tax</span>
            </div>
          ))}
        </div>
      </div>

      {/* Method note */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-blue-500 uppercase tracking-widest mb-1">How this works</p>
        <p className="text-sm text-blue-800">
          To stay free <em>forever</em>, you withdraw only your <strong>real (inflation-adjusted) post-tax return</strong>, so the corpus keeps pace with rising costs. Corpus = annual expense ÷ real return. FD &amp; debt are taxed at your slab; equity/hybrid use LTCG (~9–10% effective). This is the classic FIRE number, India-adjusted for tax.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'swp', label: 'Income & Withdrawal', desc: 'Plan withdrawals if you accept some depletion' },
        { id: 'retirement', label: 'Retirement Planner', desc: 'Retiring later? Plan the corpus + SIP' },
        { id: 'sip', label: 'SIP Calculator', desc: `Reach this corpus with a monthly SIP` },
      ]} />
    </div>
  );
}
