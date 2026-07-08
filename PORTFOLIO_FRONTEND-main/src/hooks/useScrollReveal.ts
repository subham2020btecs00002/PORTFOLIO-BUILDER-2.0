import { useEffect, useRef } from 'react';

/**
 * Custom hook to activate entrance scroll-reveal animations using Intersection Observer.
 * When elements with class '.reveal-on-scroll' become visible in viewport, 
 * the class '.revealed' is added to trigger CSS transitions/animations.
 * Respects prefers-reduced-motion and custom user animation settings.
 */
export const useScrollReveal = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const checkAndReveal = () => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      if (mediaQuery.matches || isAnimationsDisabled) {
        // Immediately reveal all elements
        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach((el) => el.classList.add('revealed'));
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      } else {
        // Set up observer
        if (!observerRef.current) {
          observerRef.current = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('revealed');
                  observerRef.current?.unobserve(entry.target);
                }
              });
            },
            {
              threshold: 0.1, // trigger when 10% of element is visible
              rootMargin: '0px 0px -40px 0px', // trigger slightly before entering to feel snappier
            }
          );
        }
        const elements = document.querySelectorAll('.reveal-on-scroll');
        elements.forEach((el) => observerRef.current?.observe(el));
      }
    };

    window.addEventListener('animations_toggle_changed', checkAndReveal);
    checkAndReveal();

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('animations_toggle_changed', checkAndReveal);
    };
  }, []);
};
