import { useState, useRef, useCallback } from 'react';

const CLICK_THRESHOLD = 3;
const CLICK_WINDOW_MS = 800;
const CRASH_DURATION_MS = 2500;

export const CRASH_KEYFRAMES = {
  '@keyframes heli-crash': {
    '0%':   { transform: 'rotate(-45deg) translate(0, 0) scale(1)', opacity: 1 },
    '5%':   { transform: 'rotate(-30deg) translate(2px, -3px) scale(1.05)', opacity: 1 },
    '10%':  { transform: 'rotate(-55deg) translate(-3px, 1px) scale(1.1)', opacity: 1 },
    '15%':  { transform: 'rotate(-35deg) translate(4px, -2px) scale(1.2)', opacity: 1 },
    '20%':  { transform: 'rotate(-60deg) translate(-2px, 4px) scale(1.3)', opacity: 1 },
    '25%':  { transform: 'rotate(-25deg) translate(3px, -1px) scale(1.5)', opacity: 1 },
    '30%':  { transform: 'rotate(-50deg) translate(-4px, 6px) scale(1.7)', opacity: 1 },
    '40%':  { transform: 'rotate(-70deg) translate(0px, 20px) scale(2.0)', opacity: 0.9 },
    '50%':  { transform: 'rotate(-90deg) translate(-5px, 50px) scale(2.3)', opacity: 0.8 },
    '60%':  { transform: 'rotate(-120deg) translate(3px, 100px) scale(2.7)', opacity: 0.7 },
    '70%':  { transform: 'rotate(-160deg) translate(-8px, 170px) scale(3.0)', opacity: 0.5 },
    '80%':  { transform: 'rotate(-200deg) translate(5px, 260px) scale(3.4)', opacity: 0.3 },
    '90%':  { transform: 'rotate(-250deg) translate(-3px, 370px) scale(3.7)', opacity: 0.15 },
    '100%': { transform: 'rotate(-300deg) translate(0px, 500px) scale(4.0)', opacity: 0 },
  },
};

export const CRASH_ANIMATION_SX = {
  ...CRASH_KEYFRAMES,
  animation: `heli-crash ${CRASH_DURATION_MS}ms ease-in forwards`,
};

/**
 * Easter egg: triple-click a nav item to make its icon "crash" like a helicopter
 * losing control during turbulence and falling down.
 */
export function useCrashEasterEgg() {
  const [crashingPaths, setCrashingPaths] = useState<Set<string>>(new Set());
  const counters = useRef<Record<string, { count: number; timer: ReturnType<typeof setTimeout> | null }>>({});

  const registerClick = useCallback((path: string) => {
    const entry = counters.current[path] ??= { count: 0, timer: null };
    entry.count += 1;
    if (entry.timer) clearTimeout(entry.timer);
    entry.timer = setTimeout(() => { entry.count = 0; }, CLICK_WINDOW_MS);

    if (entry.count >= CLICK_THRESHOLD && !crashingPaths.has(path)) {
      entry.count = 0;
      setCrashingPaths((prev) => new Set(prev).add(path));
      setTimeout(() => {
        setCrashingPaths((prev) => {
          const next = new Set(prev);
          next.delete(path);
          return next;
        });
      }, CRASH_DURATION_MS);
    }
  }, [crashingPaths]);

  const isCrashing = useCallback((path: string) => crashingPaths.has(path), [crashingPaths]);

  return { registerClick, isCrashing };
}
