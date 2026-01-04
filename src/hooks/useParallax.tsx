import { useEffect, useState, useRef, RefObject } from 'react';

interface UseParallaxOptions {
  speed?: number;
  direction?: 'up' | 'down';
}

export function useParallax<T extends HTMLElement = HTMLDivElement>({ 
  speed = 0.5, 
  direction = 'up' 
}: UseParallaxOptions = {}): { ref: RefObject<T>; offset: number } {
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      
      const rect = ref.current.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = rect.top + scrollY;
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the viewport center
      const distanceFromCenter = elementTop - scrollY - windowHeight / 2;
      const parallaxOffset = distanceFromCenter * speed * (direction === 'up' ? -1 : 1);
      
      setOffset(parallaxOffset);
    };

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (!prefersReducedMotion) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [speed, direction]);

  return { ref, offset };
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = (window.scrollY / scrollHeight) * 100;
      setProgress(Math.min(100, Math.max(0, scrollProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}
