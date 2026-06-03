import { useState, useEffect, useRef } from 'react';

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Smoothly animates a numeric value when it changes.
 * Returns the in-between display value during animation.
 */
export function useAnimatedValue(target, duration = 550) {
  const [display, setDisplay] = useState(target);
  const fromRef   = useRef(target);
  const frameRef  = useRef(null);
  const startRef  = useRef(null);
  const targetRef = useRef(target);

  useEffect(() => {
    // Capture the start value and target at the moment of change
    const from = fromRef.current;
    const to   = target;
    targetRef.current = to;

    if (from === to) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const elapsed  = ts - startRef.current;
      const progress = Math.min(1, elapsed / duration);
      const eased    = easeOutCubic(progress);
      const current  = Math.round(from + (to - from) * eased);

      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        frameRef.current = null;
      }
    }

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      // On unmount, snap to latest target
      fromRef.current = targetRef.current;
    };
  }, [target, duration]);

  return display;
}
