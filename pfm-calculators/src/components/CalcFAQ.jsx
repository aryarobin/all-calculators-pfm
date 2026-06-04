import { FAQS } from '../data/faqs';

// On-page FAQ block for a calculator. Uses native <details> so it works
// without JS and is accessible. Renders nothing if the calc has no FAQs.
export default function CalcFAQ({ id }) {
  const faqs = FAQS[id];
  if (!faqs || !faqs.length) return null;

  return (
    <section className="mt-8 pt-6 border-t border-slate-200" aria-label="Frequently asked questions">
      <h2 className="font-serif-display text-lg font-semibold text-slate-900 mb-3">Frequently asked questions</h2>
      <div className="space-y-2">
        {faqs.map((f, i) => (
          <details key={i} className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-4 py-3 text-[14px] font-semibold text-slate-800 hover:bg-slate-50 transition-colors">
              {f.q}
              <svg className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <p className="px-4 pb-3.5 -mt-0.5 text-[13px] text-slate-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
