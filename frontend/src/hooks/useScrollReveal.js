/**
 * Scroll Reveal Hook
 * Reveals elements when they come into viewport
 */

import { useEffect, useRef, useState } from 'react';

export const useScrollReveal = (options = {}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true);
            if (options.once !== false) {
              observer.unobserve(element);
            }
          } else if (!options.once) {
            setIsRevealed(false);
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '0px',
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, options.once]);

  return [elementRef, isRevealed];
};

