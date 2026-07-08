import { useEffect, useRef } from 'react';

interface TiltOptions {
  maxRotation?: number; // max tilt degrees (default: 15)
  perspective?: number; // perspective depth (default: 1000)
  scale?: number; // hover scale multiplier (default: 1.05)
  speed?: number; // transition speed in ms (default: 300)
}

/**
 * Custom React hook that applies an interactive 3D tilt effect on hover to an element.
 * Respects prefers-reduced-motion and custom user animation settings.
 */
export const use3DTilt = <T extends HTMLElement>(options: TiltOptions = {}) => {
  const elementRef = useRef<T | null>(null);
  
  const {
    maxRotation = 12,
    perspective = 1000,
    scale = 1.03,
    speed = 300
  } = options;

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    // Check for prefers-reduced-motion accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      if (isAnimationsDisabled) return;

      const rect = el.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      // Get mouse position relative to element center
      const mouseX = e.clientX - rect.left - width / 2;
      const mouseY = e.clientY - rect.top - height / 2;

      // Calculate percentage deviation (-0.5 to 0.5)
      const percentX = mouseX / width;
      const percentY = mouseY / height;

      // Calculate rotation angles (rotateY controls left-right tilt, rotateX controls up-down tilt)
      const rotateX = -(percentY * maxRotation);
      const rotateY = percentX * maxRotation;

      // Apply transition speed dynamically or use smooth transform
      el.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
      el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
    };

    const handleMouseLeave = () => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      if (isAnimationsDisabled) {
        el.style.transform = 'none';
        return;
      }
      el.style.transition = `transform ${speed}ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow ${speed}ms cubic-bezier(0.16, 1, 0.3, 1)`;
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    };

    const handleMouseEnter = () => {
      const isAnimationsDisabled = localStorage.getItem('portfolio_disable_animations') === 'true';
      if (isAnimationsDisabled) return;
      el.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [maxRotation, perspective, scale, speed]);

  return elementRef;
};
