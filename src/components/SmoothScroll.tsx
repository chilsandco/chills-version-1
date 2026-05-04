import React, { useEffect } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Disable browser's default scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // Handle initial load or route change scroll
    if (location.hash) {
      // Small delay to ensure the DOM element is rendered
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          lenis.scrollTo(element as HTMLElement);
        }
      }, 100);
    } else {
      // Reset scroll on pathname change using Lenis
      lenis.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [location.pathname, location.hash]); // Watch both for hash jumps

  return <>{children}</>;
};

export default SmoothScroll;
