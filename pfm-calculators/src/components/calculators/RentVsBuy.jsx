import { useState, useMemo } from 'react';
import SliderInput from '../shared/SliderInput';
import HeroCard from '../shared/HeroCard';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcRentVsBuy, formatINR } from '../../utils/financialCalc';

export default function RentVsBuy({ onNavigate }) {
  const [s, set] = useCalcState('rentbuy', {
    homePrice: 10000000, downPaymentPct: 20, loanRate: 8.5, loanYears: 20,
    years: 10, rentMonthly: 30000, rentHikePct: 7, homeAppreciation: 6,
    investReturn: 11, maintenancePct: 1, propertyTaxPct: 0.5,
  });
  const [showAdv, setShowAdv] = useState(false);

  const r = useMemo(() => calcRentVsBuy(s), [s]);
  const buyWins = r.winner === 'buy';

  return (
    <div className="space-y-4">
      <HeroCard
        label={`₹${(s.homePrice/10000000).toFixed(2)} Cr home vs renting at ${formatINR(s.rentMonthly)}/mo · over ${s.years} yrs`}
        value={r.difference}
        rawValue={`${buyWins ? 'Buying' : 'Renting'} wins by ${formatINR(r.difference, true)}`}
        gradient={buyWins ? 'violet' : 'emerald'}
        sub={buyWins
          ? `After ${s.years} years, owning leaves you wealthier — home equity + appreciation beat renting & investing`
          : `After ${s.years} years, renting and investing the difference builds more wealth than buying`}
        meta={[
          { label: 'Buyer net worth', value: formatINR(r.buyer.netWorth, true) },
          { label: 'Renter net worth', value: formatINR(r.renter.netWorth, true) },
          { label: 'Your EMI', value: `${formatINR(r.emi, true)}/mo` },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Buying needs <strong>{formatINR(r.down)}</strong> down + <strong className="text-violet-700">{formatINR(r.emi)}/mo</strong> EMI; after {s.years} years your home is worth <strong>{formatINR(r.buyer.homeValue, true)}</strong> with <strong>{formatINR(r.buyer.loanLeft, true)}</strong> loan left. Renting lets you invest the down payment and any monthly saving — growing to <strong className="text-emerald-700">{formatINR(r.renter.netWorth, true)}</strong>. The verdict flips on how long you stay and the price-to-rent ratio.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">The Basics</p>
        <SliderInput label="Home price" value={s.homePrice} min={1000000} max={200000000} step={500000} onChange={v => set({ homePrice: v })} prefix="₹" hint="Tap to type any value" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Current monthly rent (same home)" value={s.rentMonthly} min={5000} max={1000000} step={1000} onChange={v => set({ rentMonthly: v })} prefix="₹" />
          <SliderInput label="How long will you stay?" value={s.years} min={1} max={30} onChange={v => set({ years: v })} unit=" yr" hint="The single biggest factor" />
          <SliderInput label="Down payment" value={s.downPaymentPct} min={10} max={100} step={5} onChange={v => set({ downPaymentPct: v })} unit="%" />
          <SliderInput label="Home loan rate" value={s.loanRate} min={6} max={15} step={0.25} onChange={v => set({ loanRate: v })} unit="%" />
        </div>
        <button onClick={() => setShowAdv(a => !a)} className="text-xs text-blue-600 font-semibold hover:text-blue-800 mt-1">
          {showAdv ? 'Hide assumptions ↑' : 'Show growth & cost assumptions ↓'}
        </button>
        {showAdv && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mt-4 pt-4 border-t border-slate-100">
            <SliderInput label="Home appreciation" value={s.homeAppreciation} min={0} max={15} step={0.5} onChange={v => set({ homeAppreciation: v })} unit="%" hint="Long-term realty ~5–7%" />
            <SliderInput label="Investment return (if renting)" value={s.investReturn} min={4} max={18} step={0.5} onChange={v => set({ investReturn: v })} unit="%" />
            <SliderInput label="Annual rent hike" value={s.rentHikePct} min={0} max={15} step={0.5} onChange={v => set({ rentHikePct: v })} unit="%" />
            <SliderInput label="Loan tenure" value={s.loanYears} min={5} max={30} onChange={v => set({ loanYears: v })} unit=" yr" />
            <SliderInput label="Annual maintenance" value={s.maintenancePct} min={0} max={3} step={0.25} onChange={v => set({ maintenancePct: v })} unit="%" hint="% of home value/yr" />
            <SliderInput label="Property tax" value={s.propertyTaxPct} min={0} max={2} step={0.25} onChange={v => set({ propertyTaxPct: v })} unit="%" hint="% of home value/yr" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-2xl border-2 p-4 ${buyWins ? 'border-violet-400 bg-violet-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Buy the home</p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.buyer.netWorth, true)}</p>
          <p className="text-xs text-slate-500 mt-1">Home {formatINR(r.buyer.homeValue, true)} − loan {formatINR(r.buyer.loanLeft, true)}</p>
          {buyWins && <p className="text-xs font-bold text-violet-600 mt-2">✓ Wealthier here</p>}
        </div>
        <div className={`rounded-2xl border-2 p-4 ${!buyWins ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Rent & invest</p>
          <p className="text-2xl font-black text-slate-900 tabular-nums">{formatINR(r.renter.netWorth, true)}</p>
          <p className="text-xs text-slate-500 mt-1">Pure investment portfolio</p>
          {!buyWins && <p className="text-xs font-bold text-emerald-600 mt-2">✓ Wealthier here</p>}
        </div>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'emi', label: 'EMI Calculator', desc: 'Detailed home loan schedule' },
        { id: 'prepay', label: 'Prepay vs Invest', desc: 'Once you own — prepay or invest?' },
        { id: 'sip', label: 'SIP Calculator', desc: 'Project the renting-path investments' },
      ]} />
    </div>
  );
}
