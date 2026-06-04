// Post-build prerender: for each calculator slug, write dist/<slug>/index.html
// with route-correct <title>/meta/canonical/OG/JSON-LD AND a crawlable content
// block inside #root. No browser needed — pure string templating.
//
// The app uses createRoot().render() (client render, not hydrate), so the
// injected #root content is simply replaced when React boots — meaning real
// users see the full app, while crawlers (and no-JS) get proper per-page HTML.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { CALCULATORS, SITE_URL } from '../src/calculators.js';
import { FAQS, INTROS } from '../src/data/faqs.js';
import { GUIDES, guideBySlug } from '../src/data/guides.js';
import { byId } from '../src/calculators.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, '../dist');
const template = readFileSync(resolve(DIST, 'index.html'), 'utf8');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Group calculators for the related-links block
const related = CALCULATORS.map(c => ({ slug: c.slug, name: c.name }));

function pageHtml(calc) {
  const url = `${SITE_URL}/${calc.slug}`;
  const title = esc(calc.seoTitle);
  const desc = esc(calc.seoDesc);

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: calc.name,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: 'GoalFi', url: 'https://www.goalfi.app' },
  });

  const faqs = FAQS[calc.id] || [];
  const intro = INTROS[calc.id] || `Free ${calc.name} from GoalFi Planner — India's most complete financial calculator suite. Adjust the inputs to see results update live with charts.`;

  // FAQPage JSON-LD — eligible for FAQ rich results on Google
  const faqJsonLd = faqs.length ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  })}</script>` : '';

  // Crawlable content shown before React boots (replaced on hydrate)
  const faqHtml = faqs.length ? `
      <section style="margin-top:28px">
        <h2 style="font-size:18px;color:#0f172a;font-weight:700">Frequently asked questions</h2>
        ${faqs.map(f => `<div style="margin-top:14px">
          <h3 style="font-size:15px;color:#1e293b;font-weight:600">${esc(f.q)}</h3>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin-top:4px">${esc(f.a)}</p>
        </div>`).join('')}
      </section>` : '';

  const seoBlock = `
    <main style="max-width:760px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif">
      <h1 style="font-size:28px;font-weight:800;color:#0f172a">${esc(calc.name)}</h1>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin-top:8px">${desc}</p>
      <p style="color:#64748b;font-size:14px;margin-top:16px">${esc(intro)}</p>
      ${faqHtml}
      <nav style="margin-top:24px">
        <h2 style="font-size:15px;color:#334155;font-weight:700">More calculators</h2>
        <ul style="columns:2;font-size:14px;margin-top:8px;color:#2563eb">
          ${related.map(r => `<li><a href="${SITE_URL}/${r.slug}">${esc(r.name)}</a></li>`).join('')}
        </ul>
      </nav>
    </main>`;

  let html = template;
  // Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  // Description
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
  // Canonical
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  // OG + Twitter title/desc/url
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}" />`);
  // Replace the WebApplication JSON-LD with this page's SoftwareApplication,
  // and append the FAQPage JSON-LD right after it when present.
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonLd}</script>${faqJsonLd}`);
  // Inject crawlable content into #root
  html = html.replace('<div id="root"></div>', `<div id="root">${seoBlock}</div>`);

  return html;
}

let count = 0;
for (const calc of CALCULATORS) {
  // Flat file: dist/<slug>.html — served by nginx for the clean no-slash URL
  writeFileSync(resolve(DIST, `${calc.slug}.html`), pageHtml(calc), 'utf8');
  count++;
}

// ── /learn guide pages: Article + FAQPage schema, crawlable long-form content ──
function applyMeta(html, { title, desc, url, type = 'website', jsonLdScripts = '' }) {
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
  html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${desc}" />`);
  html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${desc}" />`);
  html = html.replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${type}" />`);
  html = html.replace(/<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description"[^>]*>/, `<meta name="twitter:description" content="${desc}" />`);
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, jsonLdScripts);
  return html;
}

function guideHtml(g) {
  const url = `${SITE_URL}/learn/${g.slug}`;
  const articleLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article',
    headline: g.h1, description: g.description, url,
    author: { '@type': 'Organization', name: 'GoalFi' },
    publisher: { '@type': 'Organization', name: 'GoalFi', url: 'https://www.goalfi.app' },
  })}</script>`;
  const faqLd = g.faqs?.length ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: g.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })}</script>` : '';

  const sections = g.sections.map(sec => `
    <h2 style="font-size:20px;color:#0f172a;font-weight:700;margin-top:24px">${esc(sec.heading)}</h2>
    ${(Array.isArray(sec.body) ? sec.body : [sec.body]).map(p => `<p style="color:#475569;font-size:16px;line-height:1.7;margin-top:8px">${esc(p)}</p>`).join('')}
  `).join('');
  const faqHtml = g.faqs?.length ? `<h2 style="font-size:20px;color:#0f172a;font-weight:700;margin-top:28px">Frequently asked questions</h2>
    ${g.faqs.map(f => `<div style="margin-top:14px"><h3 style="font-size:15px;color:#1e293b;font-weight:600">${esc(f.q)}</h3><p style="color:#475569;font-size:14px;line-height:1.6;margin-top:4px">${esc(f.a)}</p></div>`).join('')}` : '';
  const relatedHtml = (g.calcs || []).map(id => byId[id]).filter(Boolean)
    .map(c => `<li><a href="${SITE_URL}/${c.slug}">${esc(c.name)}</a></li>`).join('');

  const seoBlock = `
    <main style="max-width:760px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif">
      <nav style="font-size:13px;color:#64748b"><a href="${SITE_URL}/learn">Learn</a> › ${esc(g.h1)}</nav>
      <h1 style="font-size:30px;font-weight:800;color:#0f172a;margin-top:8px">${esc(g.h1)}</h1>
      <p style="color:#475569;font-size:17px;line-height:1.7;margin-top:10px">${esc(g.intro)}</p>
      ${sections}
      ${faqHtml}
      <h2 style="font-size:16px;color:#334155;font-weight:700;margin-top:24px">Related calculators</h2>
      <ul style="font-size:14px;margin-top:8px;color:#2563eb">${relatedHtml}</ul>
    </main>`;

  let html = applyMeta(template, { title: g.title, desc: g.description, url, type: 'article', jsonLdScripts: articleLd + faqLd });
  return html.replace('<div id="root"></div>', `<div id="root">${seoBlock}</div>`);
}

function guidesIndexHtml() {
  const url = `${SITE_URL}/learn`;
  const title = 'Learn — Money Guides for India | GoalFi Planner';
  const desc = 'Plain-language guides on SIP, retirement, tax regimes, NPS vs PPF vs EPF and mutual funds for Indian investors — each with a free calculator.';
  const list = GUIDES.map(g => `<li style="margin-top:10px"><a href="${SITE_URL}/learn/${g.slug}" style="font-weight:600">${esc(g.h1)}</a><br><span style="color:#64748b;font-size:14px">${esc(g.description)}</span></li>`).join('');
  const seoBlock = `<main style="max-width:760px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif">
    <h1 style="font-size:30px;font-weight:800;color:#0f172a">Money guides, in plain language</h1>
    <ul style="list-style:none;padding:0;margin-top:16px">${list}</ul></main>`;
  let html = applyMeta(template, { title, desc, url, jsonLdScripts: '' });
  return html.replace('<div id="root"></div>', `<div id="root">${seoBlock}</div>`);
}

mkdirSync(resolve(DIST, 'learn'), { recursive: true });
writeFileSync(resolve(DIST, 'learn.html'), guidesIndexHtml(), 'utf8');
for (const g of GUIDES) {
  writeFileSync(resolve(DIST, `learn/${g.slug}.html`), guideHtml(g), 'utf8');
  count++;
}

// Keep sitemap.xml in sync with the registry
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${CALCULATORS.map(c => `  <url>
    <loc>${SITE_URL}/${c.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
  <url>
    <loc>${SITE_URL}/learn</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
${GUIDES.map(g => `  <url>
    <loc>${SITE_URL}/learn/${g.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;
writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');

console.log(`✓ prerendered ${count} calculator pages + sitemap (${count + 1} URLs)`);
