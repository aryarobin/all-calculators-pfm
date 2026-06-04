// Post-build prerender: for each calculator slug, write dist/<slug>/index.html
// with route-correct <title>/meta/canonical/OG/JSON-LD AND a crawlable content
// block inside #root. No browser needed — pure string templating.
//
// The app uses createRoot().render() (client render, not hydrate), so the
// injected #root content is simply replaced when React boots — meaning real
// users see the full app, while crawlers (and no-JS) get proper per-page HTML.

import { readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { CALCULATORS, SITE_URL } from '../src/calculators.js';

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

  // Crawlable content shown before React boots (replaced on hydrate)
  const seoBlock = `
    <main style="max-width:760px;margin:0 auto;padding:24px;font-family:Inter,system-ui,sans-serif">
      <h1 style="font-size:28px;font-weight:800;color:#0f172a">${esc(calc.name)}</h1>
      <p style="color:#475569;font-size:16px;line-height:1.6;margin-top:8px">${desc}</p>
      <p style="color:#64748b;font-size:14px;margin-top:16px">
        Free ${esc(calc.name)} from GoalFi Planner — India's most complete financial calculator suite.
        Adjust the inputs to see results update live with charts. Loading the interactive calculator…
      </p>
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
  // Replace the WebApplication JSON-LD with this page's SoftwareApplication
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${jsonLd}</script>`);
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
</urlset>
`;
writeFileSync(resolve(DIST, 'sitemap.xml'), sitemap, 'utf8');

console.log(`✓ prerendered ${count} calculator pages + sitemap (${count + 1} URLs)`);
