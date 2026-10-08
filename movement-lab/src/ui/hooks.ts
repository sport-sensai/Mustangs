import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Clock } from '../viewer/clock';

export function useClock(clock: Clock) {
  return useSyncExternalStore(
    (cb) => clock.subscribe(cb),
    () => `${clock.time.toFixed(3)}|${clock.playing}|${clock.rate}`,
  );
}

export function useMedia(query: string) {
  const get = () => (typeof matchMedia !== 'undefined' ? matchMedia(query).matches : false);
  const [m, setM] = useState(get);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia(query);
    const on = () => setM(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return m;
}

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
