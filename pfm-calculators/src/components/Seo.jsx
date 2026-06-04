import { Helmet } from 'react-helmet-async';
import { SITE_URL } from '../calculators';

/**
 * Per-route SEO: title, description, canonical, Open Graph, and
 * SoftwareApplication JSON-LD so each calculator can rank on its own.
 */
export default function Seo({ title, description, slug, name }) {
  const url = slug ? `${SITE_URL}/${slug}` : `${SITE_URL}/`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name || title,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    publisher: { '@type': 'Organization', name: 'GoalFi', url: 'https://www.goalfi.app' },
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
