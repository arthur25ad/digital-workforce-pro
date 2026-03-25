import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Lenis from "lenis";

export default function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.05,
      wheelMultiplier: 0.92,
    });

    lenisRef.current = lenis;
    document.documentElement.classList.add("lenis");

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
      document.documentElement.classList.remove("lenis");
    };
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");

    if (!hash) {
      lenisRef.current?.scrollTo(0, { immediate: true });
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const attempt = () => {
      const element = document.getElementById(hash);
      if (!element) return;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(element, {
          offset: -112,
          duration: 1,
        });
      } else {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    const timeout = window.setTimeout(attempt, 80);
    return () => window.clearTimeout(timeout);
  }, [location.hash, location.pathname]);

  return <>{children}</>;
}
