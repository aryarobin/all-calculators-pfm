import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ArrowLeft, BookOpen } from 'lucide-react';
import { GUIDES, guideBySlug } from '../data/guides';
import { byId, SITE_URL, GOALFI_URL } from '../calculators';
import GoalFiFooter from './brand/GoalFiFooter';
import { trackSignupClick } from '../lib/analytics';

function Header({ onHome }) {
  return (
    <header className="h-12 bg-[#030338] border-b border-white/10 flex items-center px-3 sm:px-4 gap-3 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
        <img src="/goalfi-logo-white.png" alt="GoalFi" className="h-[22px] w-auto brightness-0 invert" />
        <span className="text-slate-400 font-normal text-xs border-l border-white/15 pl-2.5 hidden sm:inline">Planner</span>
      </Link>
      <span className="text-slate-400 text-xs hidden sm:block">· Learn</span>
      <div className="flex-1" />
      <a href={GOALFI_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackSignupClick('learn_header')}
        className="bg-[#CA8D1B] hover:bg-[#E6A125] text-[#030338] font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap">
        Explore GoalFi
      </a>
    </header>
  );
}

function GuidesIndex({ navigate }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>Learn — Money Guides for India | GoalFi Planner</title>
        <meta name="description" content="Plain-language guides on SIP, retirement, tax regimes, NPS vs PPF vs EPF and mutual funds for Indian investors — each with a free calculator." />
        <link rel="canonical" href={`${SITE_URL}/learn`} />
      </Helmet>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <p className="font-mono-label text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-3">GoalFi Planner — Learn</p>
        <h1 className="font-serif-display text-[30px] sm:text-[44px] leading-[1.08] text-[#1E1963] tracking-tight">Money guides, in plain language.</h1>
        <p className="text-slate-500 text-base mt-4 max-w-xl">Short, practical answers to the questions Indians actually ask — each one paired with a free calculator so you can run your own numbers.</p>
        <div className="grid gap-3 mt-8">
          {GUIDES.map(g => (
            <Link key={g.slug} to={`/learn/${g.slug}`}
              className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-[#1E1963] transition-colors flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#1E1963]/5 flex items-center justify-center flex-shrink-0">
                <BookOpen size={18} className="text-[#1E1963]" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-[#1E1963] transition-colors">{g.h1}</h2>
                <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">{g.description}</p>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-[#CA8D1B] transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </main>
      <GoalFiFooter onSelect={id => navigate(id === 'home' ? '/' : `/${byId[id]?.slug || ''}`)} />
    </div>
  );
}

export default function LearnPage() {
  const { guideSlug } = useParams();
  const navigate = useNavigate();
  const guide = guideSlug ? guideBySlug[guideSlug] : null;

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [guideSlug]);
  useEffect(() => {
    if (guideSlug && !guide) navigate('/learn', { replace: true });
  }, [guideSlug, guide, navigate]);

  if (!guideSlug) return <GuidesIndex navigate={navigate} />;
  if (!guide) return null;

  const related = (guide.calcs || []).map(id => byId[id]).filter(Boolean);
  const primary = related[0];
  const url = `${SITE_URL}/learn/${guide.slug}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Helmet>
        <title>{guide.title}</title>
        <meta name="description" content={guide.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={guide.title} />
        <meta property="og:description" content={guide.description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-7 sm:py-10">
        <Link to="/learn" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors mb-5">
          <ArrowLeft size={13} /> All guides
        </Link>

        <article>
          <h1 className="font-serif-display text-[28px] sm:text-[40px] leading-[1.1] text-[#1E1963] tracking-tight">{guide.h1}</h1>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">{guide.intro}</p>

          {primary && (
            <div className="mt-6 rounded-2xl border border-[#1E1963]/15 bg-[#1E1963]/5 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-[11px] font-bold text-[#1E1963] uppercase tracking-widest mb-0.5">Run your numbers</p>
                <p className="text-sm text-slate-700">Try the <strong>{primary.name}</strong> — free, instant, with live charts.</p>
              </div>
              <Link to={`/${primary.slug}`}
                className="inline-flex items-center gap-1.5 bg-[#1E1963] hover:bg-[#030338] text-white font-semibold text-[13px] px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                Open <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {guide.sections.map((sec, i) => (
            <section key={i} className="mt-8">
              <h2 className="font-serif-display text-xl font-semibold text-slate-900 mb-2">{sec.heading}</h2>
              {(Array.isArray(sec.body) ? sec.body : [sec.body]).map((p, j) => (
                <p key={j} className="text-[15px] text-slate-600 leading-relaxed mt-2">{p}</p>
              ))}
            </section>
          ))}

          {guide.faqs?.length > 0 && (
            <section className="mt-10 pt-6 border-t border-slate-200">
              <h2 className="font-serif-display text-xl font-semibold text-slate-900 mb-3">Frequently asked questions</h2>
              <div className="space-y-2">
                {guide.faqs.map((f, i) => (
                  <details key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3 text-[14px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
                      {f.q}
                      <svg className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <p className="px-4 pb-3.5 -mt-0.5 text-[13px] text-slate-600 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </article>

        {related.length > 0 && (
          <section className="mt-10 pt-6 border-t border-slate-200">
            <p className="font-mono-label text-[11px] uppercase tracking-[0.15em] text-slate-400 mb-3">Related calculators</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {related.map(c => (
                <Link key={c.id} to={`/${c.slug}`}
                  className="bg-white rounded-xl border border-slate-200 p-3.5 hover:border-[#1E1963] transition-colors flex items-center justify-between gap-2 group">
                  <span className="text-[13px] font-semibold text-slate-800">{c.name}</span>
                  <ArrowRight size={15} className="text-slate-300 group-hover:text-[#CA8D1B] transition-colors" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-8 flex flex-wrap gap-2">
          {GUIDES.filter(g => g.slug !== guide.slug).slice(0, 3).map(g => (
            <Link key={g.slug} to={`/learn/${g.slug}`}
              className="text-[12px] px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-[#1E1963] hover:text-[#1E1963] transition-colors">
              {g.h1}
            </Link>
          ))}
        </div>
      </main>

      <GoalFiFooter onSelect={id => navigate(id === 'home' ? '/' : `/${byId[id]?.slug || ''}`)} />
    </div>
  );
}
