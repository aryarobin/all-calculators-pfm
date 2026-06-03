import { formatINR } from '../../utils/financialCalc';

/**
 * Translates an abstract corpus number into relatable, tangible context.
 * Makes "₹2.5 Cr" feel real: passive income, years of expenses, big-ticket items.
 *
 * props:
 *   corpus           — the wealth amount
 *   monthlyExpense   — optional, to compute "years of expenses covered"
 */
export default function WealthContext({ corpus, monthlyExpense = 50000 }) {
  if (!corpus || corpus <= 0) return null;

  // Passive income at a safe 7% withdrawal
  const monthlyPassive = (corpus * 0.07) / 12;
  // Years of current lifestyle it sustains (no growth, simple)
  const yearsCovered = Math.round(corpus / (monthlyExpense * 12));

  // Tangible big-ticket equivalents (rough national-average prices)
  const ITEMS = [
    { unit: 2500000, singular: 'metro 2BHK down-payment', plural: 'metro 2BHK down-payments', emoji: '🏠' },
    { unit: 1200000, singular: 'premium sedan', plural: 'premium sedans', emoji: '🚗' },
    { unit: 500000,  singular: 'dream international trip', plural: 'dream international trips', emoji: '✈️' },
    { unit: 2000000, singular: "child's full education", plural: "children's full educations", emoji: '🎓' },
  ];

  // Pick the most meaningful tangible (largest that gives count >= 1)
  const tangible = ITEMS
    .map(it => ({ ...it, count: Math.floor(corpus / it.unit) }))
    .filter(it => it.count >= 1)
    .sort((a, b) => b.unit - a.unit)[0];

  const cards = [
    {
      emoji: '💸',
      title: 'Passive income',
      value: `${formatINR(monthlyPassive)}/mo`,
      caption: 'living off 7% returns, corpus untouched',
    },
    {
      emoji: '🗓️',
      title: 'Lifestyle runway',
      value: `${yearsCovered} years`,
      caption: `of ${formatINR(monthlyExpense)}/mo expenses`,
    },
    tangible && {
      emoji: tangible.emoji,
      title: 'In real terms',
      value: `${tangible.count}× ${tangible.count > 1 ? tangible.plural : tangible.singular}`,
      caption: 'at today\'s prices',
    },
  ].filter(Boolean);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">What this actually means</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.title} className="flex gap-3 items-start px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-xl leading-none mt-0.5">{c.emoji}</span>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{c.title}</p>
              <p className="text-base font-black text-slate-800 leading-tight tabular-nums truncate">{c.value}</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{c.caption}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
