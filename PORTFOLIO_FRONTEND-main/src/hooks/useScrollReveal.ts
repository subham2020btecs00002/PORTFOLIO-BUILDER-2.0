import { useEffect, useRef } from 'react';

/**
 * Custom hook to activate entrance scroll-reveal animations using Intersection Observer.
 * When elements with class '.reveal-on-scroll' become visible in viewport, 
 * the class '.revealed' is added to trigger CSS transitions/animations.
 */
export const useScrollReveal = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Unobserve once revealed so animation only plays once per scroll down
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1, // trigger when 10% of element is visible
        rootMargin: '0px 0px -40px 0px', // trigger slightly before entering to feel snappier
      }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
};
