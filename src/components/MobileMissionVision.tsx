// src/components/about/MobileMissionVision.tsx
import React, { useLayoutEffect, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

type Props = { t: (key: string) => string; className?: string };

// Najdi nejbližší scroll-parent (overflow-y: auto/scroll)
function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  let node: HTMLElement | null = el;
  while (node) {
    const style = getComputedStyle(node);
    const oy = style.overflowY;
    if ((oy === 'auto' || oy === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return (document.scrollingElement as HTMLElement) ?? document.body;
}

const getSVH = () => (typeof window !== 'undefined' ? window.innerHeight : 1);

// Dojezd (buffery)
const TOP_BUF = 0.05; // 5 % nahoře
const BOT_BUF = 0.05; // 5 % dole
const EPS = 0.02;     // zarovnání 2 %

const MobileMissionVision: React.FC<Props> = ({ t, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);

  // 0..1 v rámci celé výšky sekce (raw) a remapovaný progress mimo buffery
  const raw = useMotionValue(0);
  const progress = useMotionValue(0);

  // Udržuj rozsah skrolování (v px) v ref – bez zbytečných re-renderů
  const rangeRef = useRef({ start: 0, end: 1 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const sp = (scrollParentRef.current = getScrollParent(el));

    const computeRange = () => {
      if (!sp || !el) return;

      const elRect = el.getBoundingClientRect();
      const spRect = sp.getBoundingClientRect();
      const elTopInSP = elRect.top - spRect.top + sp.scrollTop;

      const height = el.offsetHeight; // např. 240svh
      const svh = getSVH();

      const start = elTopInSP;
      const end = Math.max(start + 1, elTopInSP + height - svh); // bezpečný end
      rangeRef.current = { start, end };

      updateFromScroll(); // inicializace raw/progress
    };

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

    const updateFromScroll = () => {
      if (!sp) return;
      const { start, end } = rangeRef.current;
      let r = (sp.scrollTop - start) / (end - start);
      r = clamp01(r);
      if (r < EPS) r = 0;
      else if (r > 1 - EPS) r = 1;

      raw.set(r);

      if (r <= TOP_BUF) {
        progress.set(0);
      } else if (r >= 1 - BOT_BUF) {
        progress.set(1);
      } else {
        const p = (r - TOP_BUF) / (1 - TOP_BUF - BOT_BUF);
        progress.set(p);
      }
    };

    computeRange();
    sp?.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', computeRange);
    window.addEventListener('orientationchange', computeRange);

    // drobný delay po mountu kvůli layoutu
    const tId = window.setTimeout(computeRange, 60);

    return () => {
      window.clearTimeout(tId);
      sp?.removeEventListener('scroll', updateFromScroll as any);
      window.removeEventListener('resize', computeRange);
      window.removeEventListener('orientationchange', computeRange);
    };
  }, []);

  // Easing + spring pro plynulejší odezvu
  const eased = useTransform(progress, (v) =>
    v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2
  );
  const smooth = useSpring(eased, { stiffness: 300, damping: 26, mass: 0.6 });

  // =============== 3D ORBIT (kružnice v perspektivě) ===============
  // úhel (0..π): Mission vepředu (0 rad) → Vision vepředu (π rad)
  const theta = useTransform(smooth, (v) => v * Math.PI);

  // Mission
  const mSin = useTransform(theta, (t) => Math.sin(t));
  const mCos = useTransform(theta, (t) => Math.cos(t));

  // Vision = posun o π
  const vSin = useTransform(theta, (t) => Math.sin(t + Math.PI));
  const vCos = useTransform(theta, (t) => Math.cos(t + Math.PI));

  // Parametry dráhy
  const R_PX = 120;       // horizontální poloměr
  const MAX_TILT = 28;    // max Y-rotace v °
  const BASE_SCALE = 0.9;
  const DEPTH_SCALE = 0.12;
  const BACK_BLUR = 6;
  const FRONT_BLUR = 0;

  // Mission transforms
  const missionX       = useTransform(mSin, (s) => `${s * R_PX}px`);
  const missionScale   = useTransform(mCos, (c) => BASE_SCALE + DEPTH_SCALE * (c * 0.999));
  const missionOpacity = useTransform(mCos, (c) => 0.55 + 0.45 * ((c + 1) / 2));
  const missionRotateY = useTransform(mSin, (s) => `${-s * MAX_TILT}deg`);
  const missionBlurPx  = useTransform(mCos, (c) => {
    const t = (c + 1) / 2; // -1..1 → 0..1 (vpředu 1)
    return FRONT_BLUR + (1 - t) * BACK_BLUR;
  });

  // Vision transforms
  const visionX        = useTransform(vSin, (s) => `${s * R_PX}px`);
  const visionScale    = useTransform(vCos, (c) => BASE_SCALE + DEPTH_SCALE * (c * 0.999));
  const visionOpacity  = useTransform(vCos, (c) => 0.55 + 0.45 * ((c + 1) / 2));
  const visionRotateY  = useTransform(vSin, (s) => `${-s * MAX_TILT}deg`);
  const visionBlurPx   = useTransform(vCos, (c) => {
    const t = (c + 1) / 2;
    return FRONT_BLUR + (1 - t) * BACK_BLUR;
  });

  const missionFilter  = useTransform(missionBlurPx, (b) => `blur(${b}px)`);
  const visionFilter   = useTransform(visionBlurPx, (b) => `blur(${b}px)`);

  // Nativní scroll necháváme být – žádné preventDefault
  useEffect(() => {
    // udrž progress v rozsahu i při skocích (např. anchor)
    const unsub = raw.on('change', (r) => {
      if (r <= TOP_BUF) progress.set(0);
      else if (r >= 1 - BOT_BUF) progress.set(1);
    });
    return () => unsub();
  }, []);

  return (
    // Viditelné jen < 1024 px
    <div className={`lg:hidden relative h-[240svh] ${className}`} ref={containerRef}>
      <div
        className="sticky top-0 flex items-center justify-center"
        style={{
          height: '100svh',       // stabilní výška na mobilech
          perspective: 1000,      // KLÍČ: perspektiva na kontejneru
          WebkitPerspective: 1000,
          // Důležité: nic tu neblokuje nativní scroll
        }}
      >
        {/* Vision (zadní na začátku, přední na konci) */}
        <motion.div
          style={{
            x: visionX,
            rotateY: visionRotateY,
            scale: visionScale,
            opacity: visionOpacity,
            filter: visionFilter,
            transformStyle: 'preserve-3d',
          }}
          className="absolute w-full px-4"
        >
          <Card title={t('about.vision.title')} text={t('about.vision.content')} />
        </motion.div>

        {/* Mission (přední na začátku) */}
        <motion.div
          style={{
            x: missionX,
            rotateY: missionRotateY,
            scale: missionScale,
            opacity: missionOpacity,
            filter: missionFilter,
            transformStyle: 'preserve-3d',
          }}
          className="absolute w-full px-4"
        >
          <Card title={t('about.mission.title')} text={t('about.mission.content')} />
        </motion.div>
      </div>
    </div>
  );
};

export default MobileMissionVision;

const Card: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="mx-auto max-w-md will-change-transform">
    <h3 className="text-4xl font-bold text-[#FFED29] mb-4 text-center">
      {title}
    </h3>
    <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-5 border border-white/10">
      <p className="text-lg leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  </div>
);
