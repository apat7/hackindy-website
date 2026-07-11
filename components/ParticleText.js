"use client";

import { useEffect, useRef } from "react";

// White shade buckets — particles are grouped by style so each frame draws
// one path per bucket instead of one fill per dot.
const STYLES = [
  "rgba(242, 238, 230, 0.7)",
  "rgba(242, 238, 230, 0.45)",
  "rgba(255, 255, 255, 0.6)",
  "rgba(242, 238, 230, 0.3)",
];

const TAU = Math.PI * 2;

export default function ParticleText({
  text = "HACK INDY",
  centerY = 0.5,
  className = "",
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let particles = [];
    let raf = 0;
    let cancelled = false;
    let resizeTimer = 0;
    let width = 0;
    let height = 0;
    const pointer = { x: -1e4, y: -1e4 };

    const fontFamily = getComputedStyle(canvas).fontFamily || "sans-serif";

    function build() {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = width;
      off.height = height;
      const octx = off.getContext("2d", { willReadFrequently: true });

      const lines = width < 620 ? text.split(" ") : [text];
      const maxWidth = Math.min(width * 0.92, 1560);
      const maxHeight = height * (lines.length > 1 ? 0.26 : 0.36);

      let fontSize = 10;
      const fits = (size) => {
        octx.font = `800 ${size}px ${fontFamily}`;
        const widest = Math.max(
          ...lines.map((line) => octx.measureText(line).width)
        );
        return widest <= maxWidth && size * 0.92 * lines.length <= maxHeight;
      };
      while (fits(fontSize + 8)) fontSize += 8;
      while (fits(fontSize + 1)) fontSize += 1;

      octx.font = `800 ${fontSize}px ${fontFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#fff";
      const lineHeight = fontSize * 0.92;
      const cy = height * (lines.length > 1 ? centerY - 0.03 : centerY);
      lines.forEach((line, i) => {
        octx.fillText(
          line,
          width / 2,
          cy + (i - (lines.length - 1) / 2) * lineHeight
        );
      });

      const data = octx.getImageData(0, 0, width, height).data;
      // finer sampling grid = denser, smaller dots (r scales with step)
      const step = Math.max(4, Math.round(fontSize / 38));
      const next = [];
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          if (data[(y * width + x) * 4 + 3] > 128) {
            next.push({
              x: reduceMotion ? x : Math.random() * width,
              y: reduceMotion ? y : Math.random() * height,
              hx: x + (Math.random() - 0.5) * step * 0.4,
              hy: y + (Math.random() - 0.5) * step * 0.4,
              vx: 0,
              vy: 0,
              r: step * (0.09 + Math.random() * 0.09),
              s: (Math.random() * STYLES.length) | 0,
              ph: Math.random() * TAU,
              amp: 2.2 + Math.random() * 3,
              sp: 0.8 + Math.random() * 1.4,
            });
          }
        }
      }
      particles = next;
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      for (let s = 0; s < STYLES.length; s++) {
        ctx.fillStyle = STYLES[s];
        ctx.beginPath();
        for (const p of particles) {
          if (p.s !== s) continue;
          ctx.moveTo(p.x + p.r, p.y);
          ctx.arc(p.x, p.y, p.r, 0, TAU);
        }
        ctx.fill();
      }
    }

    function frame() {
      if (cancelled) return;
      const t = performance.now() * 0.001;
      const radius = Math.max(90, width * 0.07);
      const r2 = radius * radius;
      for (const p of particles) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < r2) {
          const d = Math.sqrt(d2) || 1;
          const push = ((radius - d) / radius) * 2.4;
          p.vx += (dx / d) * push;
          p.vy += (dy / d) * push;
        }
        // dots idle around a gently wandering home, so the wordmark
        // shimmers even when the cursor is elsewhere
        const hx = p.hx + Math.sin(t * p.sp + p.ph) * p.amp;
        const hy = p.hy + Math.cos(t * p.sp * 0.9 + p.ph * 1.7) * p.amp;
        p.vx += (hx - p.x) * 0.055;
        p.vy += (hy - p.y) * 0.055;
        p.vx *= 0.84;
        p.vy *= 0.84;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
      raf = requestAnimationFrame(frame);
    }

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
    };
    const clearPointer = () => {
      pointer.x = -1e4;
      pointer.y = -1e4;
    };

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (cancelled) return;
        build();
        if (reduceMotion) draw();
      }, 120);
    });

    (async () => {
      try {
        await Promise.race([
          document.fonts.load(`800 96px ${fontFamily}`),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]);
      } catch {
        // fall back to whatever font is available
      }
      if (cancelled) return;
      build();
      resizeObserver.observe(canvas);
      if (reduceMotion) {
        draw();
      } else {
        window.addEventListener("pointermove", onPointerMove, {
          passive: true,
        });
        window.addEventListener("pointerdown", onPointerMove, {
          passive: true,
        });
        window.addEventListener("pointerup", clearPointer, { passive: true });
        window.addEventListener("blur", clearPointer);
        document.documentElement.addEventListener("pointerleave", clearPointer);
        frame();
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerMove);
      window.removeEventListener("pointerup", clearPointer);
      window.removeEventListener("blur", clearPointer);
      document.documentElement.removeEventListener("pointerleave", clearPointer);
    };
  }, [text, centerY]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
