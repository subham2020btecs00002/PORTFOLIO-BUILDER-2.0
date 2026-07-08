import { useEffect, useRef } from 'react';

/**
 * A custom hook that animates the drawing of an SVG path based on scroll progress.
 * Respects prefers-reduced-motion and custom user animation settings.
 */
export const useTimelineDraw = <T extends SVGPathElement>() => {
  const pathRef = useRef<T | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const handleReveal = () => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      if (mediaQuery.matches || isAnimationsDisabled) {
        path.style.strokeDasharray = '';
        path.style.strokeDashoffset = '0';
      } else {
        const length = path.getTotalLength();
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = `${length}`;
        handleScroll();
      }
    };

    const handleScroll = () => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      if (isAnimationsDisabled) return;

      const rect = path.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how much of the SVG container has entered the viewport
      const totalScrollableHeight = windowHeight + rect.height;
      const amountScrolled = windowHeight - rect.top;
      
      // Clamp progress between 0 and 1
      let progress = amountScrolled / totalScrollableHeight;
      progress = Math.max(0, Math.min(1, progress));

      // Draw the line proportionally
      const length = path.getTotalLength();
      path.style.strokeDashoffset = `${length - progress * length}`;
    };

    window.addEventListener('animations_toggle_changed', handleReveal);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    
    // Run initially
    handleReveal();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('animations_toggle_changed', handleReveal);
    };
  }, []);

  return pathRef;
};
