'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

export function ParallaxComponent() {
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis();
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      if (triggerElement) gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div ref={parallaxRef}>
      <section className="w-full h-[300vh] relative" data-parallax-layers>
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <div
            data-parallax-layer="1"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full bg-gradient-to-b from-background to-muted" />
          </div>

          <div
            data-parallax-layer="2"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-full h-full opacity-60 bg-gradient-to-t from-primary/10 to-transparent" />
          </div>

          <div
            data-parallax-layer="3"
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              data-parallax-layer="4"
              className="relative z-10 text-center"
            >
              <h2 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
                Parallax
              </h2>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Resource by Osmo
          </p>
        </div>
      </section>
    </div>
  );
}

export default ParallaxComponent;
