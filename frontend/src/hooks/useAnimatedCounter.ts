import { useState, useEffect, useRef } from 'react';

interface UseAnimatedCounterOptions {
  duration?: number;
  decimals?: number;
}

export const useAnimatedCounter = (
  targetValue: number,
  options: UseAnimatedCounterOptions = {}
): number => {
  const { duration = 600, decimals = 0 } = options;
  const [displayValue, setDisplayValue] = useState<number>(targetValue);
  const startValueRef = useRef<number>(targetValue);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = startValueRef.current;
    const diff = targetValue - startValue;

    if (diff === 0) {
      setDisplayValue(targetValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing cúbico desacelerado (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + diff * easeProgress;

      const factor = Math.pow(10, decimals);
      setDisplayValue(Math.round(nextValue * factor) / factor);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        startValueRef.current = targetValue;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      startValueRef.current = targetValue;
    };
  }, [targetValue, duration, decimals]);

  return displayValue;
};

