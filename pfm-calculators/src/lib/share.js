// Shareable result links — encode a calculator's inputs into the URL so
// "here's my plan" is one tap (great for WhatsApp). Inputs are base64-encoded
// JSON tagged with the calc id so a link only hydrates its own calculator.

export function encodeState(calcId, state) {
  try {
    const payload = JSON.stringify({ _id: calcId, ...state });
    // encodeURIComponent first so non-ASCII (₹ etc.) survives btoa
    return btoa(unescape(encodeURIComponent(payload)));
  } catch {
    return '';
  }
}

export function decodeStateFromUrl(calcId) {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('s');
    if (!raw) return null;
    const json = decodeURIComponent(escape(atob(raw)));
    const obj = JSON.parse(json);
    if (!obj || obj._id !== calcId) return null;
    const { _id, ...rest } = obj;
    return rest;
  } catch {
    return null;
  }
}

// Build a full shareable URL for a calculator slug + its current state.
export function buildShareUrl(slug, calcId, state) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const enc = encodeState(calcId, state);
  return `${origin}/${slug}${enc ? `?s=${enc}` : ''}`;
}
