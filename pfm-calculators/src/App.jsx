import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GoalFiFooter from './components/brand/GoalFiFooter';
import Seo from './components/Seo';
import CalcFAQ from './components/CalcFAQ';
import { trackCalcView, trackSignupClick } from './lib/analytics';
import { buildShareUrl } from './lib/share';
import { CALCULATORS, byId, bySlug, NAV_GROUP_ORDER, GOALFI_URL } from './calculators';

import SIPCalculator from './components/calculators/SIPCalculator';
import LumpsumCalculator from './components/calculators/LumpsumCalculator';
import StepUpSIPCalculator from './components/calculators/StepUpSIPCalculator';
import GoalPlanning from './components/calculators/GoalPlanning';
import RetirementCalculator from './components/calculators/RetirementCalculator';
import RetirementReadiness from './components/calculators/RetirementReadiness';
import CAGRCalculator from './components/calculators/CAGRCalculator';
import MoneyMultiplier from './components/calculators/MoneyMultiplier';
import InflationCalculator from './components/calculators/InflationCalculator';
import EMICalculator from './components/calculators/EMICalculator';
import FDPPFCalculator from './components/calculators/FDPPFCalculator';
import TaxCalculator from './components/calculators/TaxCalculator';
import InvestmentComparison from './components/calculators/InvestmentComparison';
import SWPCalculator from './components/calculators/SWPCalculator';
import SalaryCalculator from './components/calculators/SalaryCalculator';
import BudgetPlanner from './components/calculators/BudgetPlanner';
import FinancialTimeline from './components/calculators/FinancialTimeline';
import FinancialFreedom from './components/calculators/FinancialFreedom';
import CoastFire from './components/calculators/CoastFire';
import PrepayVsInvest from './components/calculators/PrepayVsInvest';
import RentVsBuy from './components/calculators/RentVsBuy';
import XIRRCalculator from './components/calculators/XIRRCalculator';
import CapitalGainsTax from './components/calculators/CapitalGainsTax';
import EmergencyFund from './components/calculators/EmergencyFund';
import SukanyaSamriddhi from './components/calculators/SukanyaSamriddhi';
import CreditCardPayoff from './components/calculators/CreditCardPayoff';
import NetWorth from './components/calculators/NetWorth';
import SimpleVsCompound from './components/calculators/SimpleVsCompound';
import InsuranceVsInvestment from './components/calculators/InsuranceVsInvestment';
import TermCoverNeeded from './components/calculators/TermCoverNeeded';
import DirectVsRegular from './components/calculators/DirectVsRegular';
import LumpsumVsSIP from './components/calculators/LumpsumVsSIP';
import CrorepatiTimeline from './components/calculators/CrorepatiTimeline';
import HealthCoverNeeded from './components/calculators/HealthCoverNeeded';
import EPFvsNPSvsVPF from './components/calculators/EPFvsNPSvsVPF';
import CostOfDelay from './components/calculators/CostOfDelay';
import GoldInvestment from './components/calculators/GoldInvestment';
import RealReturn from './components/calculators/RealReturn';
import JobSwitch from './components/calculators/JobSwitch';
import PostOfficeSchemes from './components/calculators/PostOfficeSchemes';
import BrokerageCharges from './components/calculators/BrokerageCharges';
import IndexVsActive from './components/calculators/IndexVsActive';
import GrowthVsIDCW from './components/calculators/GrowthVsIDCW';
import DebtFundVsFD from './components/calculators/DebtFundVsFD';
import ELSSCalculator from './components/calculators/ELSSCalculator';
import LTCGHarvest from './components/calculators/LTCGHarvest';
import AssetAllocation from './components/calculators/AssetAllocation';
import SIPLumpsumCombo from './components/calculators/SIPLumpsumCombo';
import Dashboard from './components/Dashboard';

const COMPONENTS = {
  sip: SIPCalculator, lumpsum: LumpsumCalculator, stepup: StepUpSIPCalculator,
  compare: InvestmentComparison, goal: GoalPlanning, retirement: RetirementCalculator,
  readiness: RetirementReadiness, swp: SWPCalculator, fire: FinancialFreedom, coast: CoastFire,
  timeline: FinancialTimeline, cagr: CAGRCalculator, multiplier: MoneyMultiplier, inflation: InflationCalculator,
  xirr: XIRRCalculator, prepay: PrepayVsInvest, rentbuy: RentVsBuy,
  emi: EMICalculator, fdppf: FDPPFCalculator, tax: TaxCalculator,
  salary: SalaryCalculator, budget: BudgetPlanner,
  capgains: CapitalGainsTax, ssy: SukanyaSamriddhi, emergency: EmergencyFund,
  creditcard: CreditCardPayoff, networth: NetWorth, simplecompound: SimpleVsCompound,
  insurevsinvest: InsuranceVsInvestment, termcover: TermCoverNeeded, directregular: DirectVsRegular,
  lumpvssip: LumpsumVsSIP, crorepati: CrorepatiTimeline,
  healthcover: HealthCoverNeeded, epfnpsvpf: EPFvsNPSvsVPF, costofdelay: CostOfDelay, gold: GoldInvestment,
  realreturn: RealReturn, jobswitch: JobSwitch, postoffice: PostOfficeSchemes, brokerage: BrokerageCharges,
  indexactive: IndexVsActive, growthidcw: GrowthVsIDCW, debtvsfd: DebtFundVsFD, elss: ELSSCalculator,
  ltcgharvest: LTCGHarvest, assetalloc: AssetAllocation, siplumpsum: SIPLumpsumCombo,
};

const NAV_GROUPS = NAV_GROUP_ORDER.map(label => ({
  label,
  items: CALCULATORS.filter(c => c.group === label),
}));

const HOME_SEO = {
  title: 'Free Financial Calculators for India — SIP, Retirement, EMI, Tax | GoalFi Planner',
  description: "India's most complete free financial calculator suite. Plan SIP, lumpsum, retirement, EMI, income tax, FD/PPF/NPS and more — with live charts.",
};

export default function App() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shared, setShared] = useState(false);
  const mainRef = useRef(null);

  const currentCalc = slug ? bySlug[slug] : null;
  const isHome = !slug;
  const ActiveComponent = currentCalc ? COMPONENTS[currentCalc.id] : null;

  // Unknown slug → home
  useEffect(() => {
    if (slug && !currentCalc) navigate('/', { replace: true });
  }, [slug, currentCalc, navigate]);

  // Scroll top + track on route change. The scroll container is <main>
  // (it has overflow-y-auto), not the window — so scroll that element.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (currentCalc) trackCalcView(currentCalc.id, currentCalc.name);
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelect = (id) => {
    setSidebarOpen(false);
    if (id === 'home') { navigate('/'); return; }
    const cal = byId[id];
    navigate(cal ? `/${cal.slug}` : '/');
  };

  // Copy a shareable link with the current calculator's inputs encoded in the URL
  const handleShare = async () => {
    if (!currentCalc) return;
    let state = {};
    try { state = JSON.parse(localStorage.getItem(`pfm-${currentCalc.id}`) || '{}'); } catch {}
    const url = buildShareUrl(currentCalc.slug, currentCalc.id, state);
    try {
      if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
        await navigator.share({ title: `${currentCalc.name} — GoalFi Planner`, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch { /* user dismissed share sheet */ }
  };

  const seo = currentCalc
    ? { title: currentCalc.seoTitle, description: currentCalc.seoDesc, slug: currentCalc.slug, name: currentCalc.name }
    : { title: HOME_SEO.title, description: HOME_SEO.description, slug: '', name: 'GoalFi Planner' };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50">
      <Seo {...seo} />

      {/* Top bar — GoalFi branded */}
      <header className="flex-shrink-0 h-12 bg-[#030338] border-b border-white/10 flex items-center px-3 sm:px-4 gap-3 z-50">
        {!isHome && (
          <button onClick={() => setSidebarOpen(o => !o)} className="lg:hidden text-slate-400 hover:text-white transition-colors p-1" aria-label="Menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <button onClick={() => handleSelect('home')} className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <img src="/goalfi-logo-white.png" alt="GoalFi" className="h-[22px] w-auto" />
          <span className="text-slate-400 font-normal text-xs border-l border-white/15 pl-2.5 hidden sm:inline">Planner</span>
        </button>

        {currentCalc && (
          <>
            <span className="w-px h-4 bg-white/15 hidden sm:block"></span>
            <span className="text-slate-400 text-xs hidden sm:block">{currentCalc.name}</span>
          </>
        )}

        <div className="flex-1"></div>

        {currentCalc && (
          <button onClick={handleShare}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap"
            aria-label="Share this calculation">
            {shared ? (
              <>
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <span className="hidden sm:inline">Copied</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        )}

        <a href={GOALFI_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => trackSignupClick('header')}
          className="bg-[#CA8D1B] hover:bg-[#E6A125] text-[#030338] font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          Explore GoalFi
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on the home/landing page for a full-width website feel */}
        {!isHome && (
          <nav className={`fixed lg:relative top-12 left-0 bottom-0 z-40 w-52 bg-[#030338] border-r border-white/10 overflow-y-auto flex-shrink-0 transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
            <div className="p-3 pt-3">
              <button onClick={() => handleSelect('home')}
                className="nav-link w-full text-left mb-1">
                ← Home
              </button>
              {NAV_GROUPS.map(group => (
                <div key={group.label} className="mt-4">
                  <p className="px-3 mb-1 text-[11px] font-semibold text-slate-600 uppercase tracking-widest">{group.label}</p>
                  {group.items.map(item => (
                    <button key={item.id} onClick={() => handleSelect(item.id)}
                      className={currentCalc?.id === item.id ? 'nav-link-active w-full text-left' : 'nav-link w-full text-left'}>
                      {item.name}
                    </button>
                  ))}
                </div>
              ))}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="px-3 text-[11px] text-slate-600">All calculations are estimates. Consult a SEBI-registered advisor.</p>
              </div>
            </div>
          </nav>
        )}

        {!isHome && sidebarOpen && (
          <div className="fixed inset-0 top-12 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}

        {/* Main */}
        <main ref={mainRef} className="flex-1 overflow-y-auto">
          {!isHome && (
            <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-slate-100 px-3 py-2">
              <div className="overflow-x-auto scrollbar-none">
                <div className="flex gap-1 w-max">
                  {CALCULATORS.map(c => (
                    <button key={c.id} onClick={() => handleSelect(c.id)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium whitespace-nowrap transition-colors ${currentCalc?.id === c.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`${isHome ? 'max-w-6xl' : 'max-w-5xl'} mx-auto px-3 sm:px-6 py-4 sm:py-6`}>
            {!isHome && currentCalc && (
              <div className="flex items-center gap-2 mb-5">
                <button onClick={() => handleSelect('home')} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Overview</button>
                <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path d="M9 18l6-6-6-6" /></svg>
                <span className="text-xs text-slate-600 font-medium">{currentCalc.name}</span>
              </div>
            )}

            {isHome
              ? <Dashboard onSelect={handleSelect} />
              : ActiveComponent && (
                <>
                  <ActiveComponent onNavigate={handleSelect} />
                  <CalcFAQ id={currentCalc.id} />
                </>
              )
            }
          </div>

          <GoalFiFooter onSelect={handleSelect} />
        </main>
      </div>
    </div>
  );
}
