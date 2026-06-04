import { useMemo } from 'react';
import HeroCard from '../shared/HeroCard';
import SliderInput from '../shared/SliderInput';
import NextSteps from '../shared/NextSteps';
import { useCalcState } from '../../hooks/useCalcState';
import { calcSIP, formatINR } from '../../utils/financialCalc';

// Typical discount-broker charges. Intraday and delivery differ on STT & brokerage.
function tradeCost({ turnoverPerTrade, mode, brokerageFlat }) {
  const buy = turnoverPerTrade, sell = turnoverPerTrade;
  // Brokerage: flat ₹X or 0.03% whichever lower, per leg (discount-broker style)
  const brokPerLeg = Math.min(brokerageFlat, turnoverPerTrade * 0.0003);
  const brokerage = brokPerLeg * 2;
  // STT: delivery 0.1% both legs; intraday 0.025% on sell only
  const stt = mode === 'delivery' ? (buy + sell) * 0.001 : sell * 0.00025;
  // Exchange txn charges ~0.00297% per leg (NSE), SEBI + stamp approximated
  const exch = (buy + sell) * 0.0000297;
  const stamp = buy * 0.00015; // stamp duty on buy
  const sebi = (buy + sell) * 0.000001;
  const gstBase = brokerage + exch + sebi;
  const gst = gstBase * 0.18;
  // DP charges apply per sell (delivery) — flat ~₹15-20
  const dp = mode === 'delivery' ? 18 : 0;
  return brokerage + stt + exch + stamp + sebi + gst + dp;
}

export default function BrokerageCharges({ onNavigate }) {
  const [s, set] = useCalcState('brokerage', {
    tradesPerMonth: 20, turnoverPerTrade: 50000, mode: 'intraday',
    brokerageFlat: 20, years: 10, investReturn: 12,
  });

  const r = useMemo(() => {
    const perTrade = tradeCost({ turnoverPerTrade: s.turnoverPerTrade, mode: s.mode, brokerageFlat: s.brokerageFlat });
    const monthly = perTrade * s.tradesPerMonth;
    const yearly = monthly * 12;
    const pctOfTurnover = s.turnoverPerTrade > 0 ? perTrade / s.turnoverPerTrade * 100 : 0;
    // If you'd invested that yearly charge as a SIP instead
    const wouldHaveGrown = calcSIP(monthly, s.investReturn, s.years).corpus;
    return { perTrade, monthly, yearly, pctOfTurnover, wouldHaveGrown };
  }, [s]);

  return (
    <div className="space-y-4">
      <HeroCard
        label={`What trading costs you every year`}
        value={r.yearly}
        gradient="rose"
        sub={`${s.tradesPerMonth} trades/month at ${formatINR(s.turnoverPerTrade)} each — charges add up to a serious drag`}
        meta={[
          { label: 'Per trade', value: formatINR(r.perTrade) },
          { label: 'Per month', value: formatINR(r.monthly) },
          { label: 'Per year', value: formatINR(r.yearly, true) },
        ]}
      />

      <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
        <p className="text-sm text-slate-600">
          Each {s.mode} trade of {formatINR(s.turnoverPerTrade)} costs about <strong>{formatINR(r.perTrade)}</strong> in brokerage, STT, exchange, stamp duty, SEBI fees, GST{s.mode === 'delivery' ? ' and DP charges' : ''} — roughly <strong>{r.pctOfTurnover.toFixed(2)}%</strong> of turnover. At {s.tradesPerMonth} trades a month that's <strong className="text-[#E33434]">{formatINR(r.yearly)}/year</strong>. Invested as a SIP at {s.investReturn}% instead, those charges alone would have grown to <strong>{formatINR(r.wouldHaveGrown)}</strong> in {s.years} years.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-5 pb-4">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Trade Type</p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[['intraday', 'Intraday'], ['delivery', 'Delivery']].map(([id, label]) => (
            <button key={id} onClick={() => set({ mode: id })}
              className={`px-3 py-2.5 rounded-xl border-2 text-[13px] font-bold transition-all ${s.mode === id ? 'border-[#1E1963] bg-[#1E1963]/5 text-[#1E1963]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>
        <SliderInput label="Trades per month" value={s.tradesPerMonth} min={1} max={500} onChange={v => set({ tradesPerMonth: v })} unit=" trades" hint="Tap to type" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <SliderInput label="Turnover per trade" value={s.turnoverPerTrade} min={5000} max={2000000} step={5000} onChange={v => set({ turnoverPerTrade: v })} prefix="₹" />
          <SliderInput label="Broker flat fee / leg" hint="Discount brokers ~₹20" value={s.brokerageFlat} min={0} max={100} onChange={v => set({ brokerageFlat: v })} prefix="₹" />
          <SliderInput label="If invested instead, for" value={s.years} min={1} max={30} onChange={v => set({ years: v })} unit=" yr" />
          <SliderInput label="Assumed return" value={s.investReturn} min={6} max={18} step={0.5} onChange={v => set({ investReturn: v })} unit="%" />
        </div>
      </div>

      <div className="bg-[#1E1963]/5 border border-[#1E1963]/10 rounded-2xl px-5 py-4">
        <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-1">The hidden tax on activity</p>
        <p className="text-sm text-slate-700">
          Frequent trading rarely beats the market, and the charges are a guaranteed loss before you even count bad trades. STT and stamp duty don't care if you win or lose. For most people, fewer trades and long-term holding quietly outperforms — and costs a fraction of this.
        </p>
      </div>

      <NextSteps onNavigate={onNavigate} steps={[
        { id: 'directregular', label: 'Direct vs Regular MF', desc: 'Another hidden cost drag' },
        { id: 'xirr', label: 'XIRR Calculator', desc: 'Your real post-cost return' },
        { id: 'sip', label: 'SIP Calculator', desc: 'The boring path that wins' },
      ]} />
    </div>
  );
}
