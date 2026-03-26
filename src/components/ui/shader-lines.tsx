"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { cn } from "@/lib/utils";

interface ShaderAnimationProps {
  className?: string;
}

export function ShaderAnimation({ className }: ShaderAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupResizeRef = useRef<(() => void) | null>(null);
  const sceneRef = useRef<{
    camera: THREE.Camera | null;
    scene: THREE.Scene | null;
    renderer: THREE.WebGLRenderer | null;
    uniforms: {
      time: { value: number };
      resolution: { value: THREE.Vector2 };
    } | null;
    animationId: number | null;
  }>({
    camera: null,
    scene: null,
    renderer: null,
    uniforms: null,
    animationId: null,
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.innerHTML = "";

    const camera = new THREE.Camera();
    camera.position.z = 1;

    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneGeometry(2, 2);

    const uniforms = {
      time: { value: 1.0 },
      resolution: { value: new THREE.Vector2() },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        #define TWO_PI 6.2831853072
        #define PI 3.14159265359

        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        float random(in float x) {
          return fract(sin(x) * 1e4);
        }

        float random(vec2 st) {
          return fract(
            sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123
          );
        }

        varying vec2 vUv;

        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

          vec2 fMosaicScal = vec2(4.0, 2.0);
          vec2 vScreenSize = vec2(256, 256);
          uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
          uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

          float t = time * 0.06 + random(uv.x) * 0.4;
          float lineWidth = 0.0008;

          vec3 color = vec3(0.0);
          for (int j = 0; j < 3; j++) {
            for (int i = 0; i < 5; i++) {
              color[j] += lineWidth * float(i * i) / abs(fract(t - 0.01 * float(j) + float(i) * 0.01) * 1.0 - length(uv));
            }
          }

          gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
        }
      `,
      transparent: true,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height, false);
      uniforms.resolution.value.set(
        rect.width * renderer.getPixelRatio(),
        rect.height * renderer.getPixelRatio(),
      );
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize, false);
    resize();

    const animate = () => {
      sceneRef.current.animationId = window.requestAnimationFrame(animate);
      uniforms.time.value += 0.05;
      renderer.render(scene, camera);
    };

    sceneRef.current = {
      camera,
      scene,
      renderer,
      uniforms,
      animationId: null,
    };

    cleanupResizeRef.current = () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
    };

    animate();

    return () => {
      cleanupResizeRef.current?.();
      if (sceneRef.current.animationId) {
        window.cancelAnimationFrame(sceneRef.current.animationId);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className={cn("absolute inset-0 h-full w-full", className)} />;
}
