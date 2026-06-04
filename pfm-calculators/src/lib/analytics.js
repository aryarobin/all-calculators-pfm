// ── Unified analytics layer ───────────────────────────────────────────────
// Fires events to GA4, PostHog, and Microsoft Clarity simultaneously.
// Each provider activates only when its ID is present (Vite build-time env):
//   VITE_GA4_ID        e.g. G-XXXXXXXXXX
//   VITE_POSTHOG_KEY   e.g. phc_xxxxxxxx
//   VITE_POSTHOG_HOST  e.g. https://us.i.posthog.com  (optional)
//   VITE_CLARITY_ID    e.g. abcdefghij
//
// All calls are safe no-ops when IDs are missing — instrument freely.

const GA4_ID       = import.meta.env.VITE_GA4_ID;
const POSTHOG_KEY  = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com';
const CLARITY_ID   = import.meta.env.VITE_CLARITY_ID;

let initialised = false;

function loadScript(src, attrs = {}) {
  const sc = document.createElement('script');
  sc.async = true;
  sc.src = src;
  Object.entries(attrs).forEach(([k, v]) => sc.setAttribute(k, v));
  document.head.appendChild(sc);
  return sc;
}

export function initAnalytics() {
  if (initialised || typeof window === 'undefined') return;
  initialised = true;

  // ── GA4 ──
  if (GA4_ID) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: true });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`);
  }

  // ── PostHog ──
  if (POSTHOG_KEY) {
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    window.posthog.init(POSTHOG_KEY, { api_host: POSTHOG_HOST, capture_pageview: true, autocapture: true, persistence: 'localStorage+cookie' });
    /* eslint-enable */
  }

  // ── Microsoft Clarity ──
  if (CLARITY_ID) {
    /* eslint-disable */
    (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script",CLARITY_ID);
    /* eslint-enable */
  }
}

// ── Public API ─────────────────────────────────────────────────────────────

export function track(event, props = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (GA4_ID && window.gtag) window.gtag('event', event, props);
    if (POSTHOG_KEY && window.posthog) window.posthog.capture(event, props);
    if (CLARITY_ID && window.clarity) window.clarity('event', event);
  } catch (_) { /* never break the app for analytics */ }
}

export function trackPageView(path, title) {
  if (typeof window === 'undefined') return;
  if (GA4_ID && window.gtag) window.gtag('event', 'page_view', { page_path: path, page_title: title });
  if (POSTHOG_KEY && window.posthog) window.posthog.capture('$pageview', { path });
}

// Funnel-specific helpers
export const trackCalcView   = (id, name) => track('calculator_view', { calculator_id: id, calculator_name: name });
export const trackSearch     = (query, matched) => track('search_query', { query, matched_id: matched || null });
export const trackCtaClick   = (location, target) => track('cta_click', { location, target });
export const trackSignupClick = (location) => track('signup_click', { location, destination: 'app.goalfi.app' });
export const trackToolAction = (calc, action) => track('tool_action', { calculator_id: calc, action });

export const analyticsEnabled = !!(GA4_ID || POSTHOG_KEY || CLARITY_ID);
