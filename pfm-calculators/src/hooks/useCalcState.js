import { useState, useCallback } from 'react';

export function useCalcState(calcId, defaults) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(`pfm-${calcId}`);
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch { return defaults; }
  });

  const update = useCallback((patch) => {
    setState(prev => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
      try { localStorage.setItem(`pfm-${calcId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [calcId]);

  return [state, update];
}
