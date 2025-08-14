// src/components/about/MobileMissionVision.tsx
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

type Props = { t: (key: string) => string; className?: string };

// najdi nejbližší scroll-parent (overflow-y: auto/scroll)
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
  return document.scrollingElement as HTMLElement | null;
}

const getVH = () => (typeof window !== 'undefined' ? window.innerHeight : 1);

// --- Dojezd (buffery) ---
const TOP_BUF = 0.05; // 5 % nahoře
const BOT_BUF = 0.05; // 5 % dole
const EPS = 0.02;     // zarovnání 2 %

const MobileMissionVision: React.FC<Props> = ({ t, className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const scrollParentRef = useRef<HTMLElement | null>(null);

  // raw progress 0..1 v rámci celé výšky sekce
  const raw = useMotionValue(0);

  // remapovaný progress 0..1 jen pro střední část (mimo buffery)
  const progress = useMotionValue(0);

  // jsme uprostřed (0<raw<1) mimo buffery → blokujeme rodiče
  const midActiveRef = useRef(false);

  const [range, setRange] = useState({ start: 0, end: 1 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    scrollParentRef.current = getScrollParent(el);

    const recalc = () => {
      const sp = scrollParentRef.current;
      if (!sp) return;

      // pozice elementu v rámci scroll-parentu
      const elRect = el.getBoundingClientRect();
      const spRect = sp.getBoundingClientRect();
      const elTopInSP = elRect.top - spRect.top + sp.scrollTop;

      const height = el.offsetHeight; // např. 240vh
      const vh = getVH();

      const start = elTopInSP;
      const end = elTopInSP + height - vh;
      const safeEnd = Math.max(start + 1, end);

      setRange({ start, end: safeEnd });

      const update = () => {
        let r = (sp.scrollTop - start) / (safeEnd - start);
        r = Math.max(0, Math.min(1, r));
        if (r < EPS) r = 0;
        else if (r > 1 - EPS) r = 1;

        raw.set(r);

        if (r <= TOP_BUF) {
          progress.set(0);
          midActiveRef.current = false;
        } else if (r >= 1 - BOT_BUF) {
          progress.set(1);
          midActiveRef.current = false;
        } else {
          const p = (r - TOP_BUF) / (1 - TOP_BUF - BOT_BUF);
          progress.set(p);
          midActiveRef.current = true;
        }
      };

      update();
    };

    const onScroll = () => {
      const sp = scrollParentRef.current;
      if (!sp) return;
      const { start, end } = range;

      let r = (sp.scrollTop - start) / (end - start);
      r = Math.max(0, Math.min(1, r));
      if (r < EPS) r = 0;
      else if (r > 1 - EPS) r = 1;

      raw.set(r);

      if (r <= TOP_BUF) {
        progress.set(0);
        midActiveRef.current = false;
      } else if (r >= 1 - BOT_BUF) {
        progress.set(1);
        midActiveRef.current = false;
      } else {
        const p = (r - TOP_BUF) / (1 - TOP_BUF - BOT_BUF);
        progress.set(p);
        midActiveRef.current = true;
      }
    };

    recalc();
    const sp = scrollParentRef.current;
    sp?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', recalc);
    window.addEventListener('orientationchange', recalc);

    const tId = window.setTimeout(recalc, 60);
    return () => {
      window.clearTimeout(tId);
      sp?.removeEventListener('scroll', onScroll as any);
      window.removeEventListener('resize', recalc);
      window.removeEventListener('orientationchange', recalc);
    };
  }, [range.start, range.end]);

  // --- Plynulejší odezva: easing + spring ---
  const eased = useTransform(progress, (v) =>
    v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2
  );
  const smooth = useSpring(eased, { stiffness: 300, damping: 26, mass: 0.6 });

  // ===================== 3D ORBIT (kružnice v perspektivě) =====================
  // úhel (0..π) → půl-orbita: Mission vepředu (0 rad) → Vision vepředu (π rad)
  const theta = useTransform(smooth, (v) => v * Math.PI);

  // SIN/COS pro Mission
  const mSin = useTransform(theta, (t) => Math.sin(t));     // -1..1
  const mCos = useTransform(theta, (t) => Math.cos(t));     //  1..-1 (hloubka)

  // Pro Vision je to posun o π (opačný bod kružnice)
  const vSin = useTransform(theta, (t) => Math.sin(t + Math.PI));
  const vCos = useTransform(theta, (t) => Math.cos(t + Math.PI));

  // Parametry „kružnice“
  const R_PX = 120;      // horizontální poloměr (boční posun)
  const MAX_TILT = 28;   // max Y-rotace v ° (naklopení do strany)
  const BASE_SCALE = 0.9;
  const DEPTH_SCALE = 0.12;  // kolik scale přidá hloubka (cos)
  const BACK_BLUR = 6;       // blur vzadu
  const FRONT_BLUR = 0;      // blur vpředu

  // Mission (přední na začátku)
  const missionX       = useTransform(mSin, (s) => `${s * R_PX}px`);
  const missionScale   = useTransform(mCos, (c) => BASE_SCALE + DEPTH_SCALE * (c * 0.999));
  const missionOpacity = useTransform(mCos, (c) => 0.55 + 0.45 * ((c + 1) / 2)); // -1..1 → 0..1
  const missionRotateY = useTransform(mSin, (s) => `${-s * MAX_TILT}deg`);
  const missionBlurPx  = useTransform(mCos, (c) => {
    const t = (c + 1) / 2; // -1..1 → 0..1 (vpředu 1)
    return FRONT_BLUR + (1 - t) * BACK_BLUR;
  });

  // Vision (zadní na začátku, přední na konci)
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

  // ===== Zachytávání wheel/touch uprostřed (mimo buffery) =====
  const handleWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (midActiveRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = () => {};
  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (midActiveRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = () => {};

  useEffect(() => {
    const unsub = raw.on('change', (r) => {
      midActiveRef.current = r > TOP_BUF && r < (1 - BOT_BUF);
    });
    return () => unsub();
  }, []);

  return (
    // lg:hidden = viditelné jen pro šířky < 1024 px
    <div className={`lg:hidden relative h-[240vh] ${className}`} ref={containerRef}>
      <div
        className="sticky top-0 h-screen flex items-center justify-center"
        style={{ perspective: 1000 }} // KLÍČ: perspektiva na kontejneru
      >
        {/* overlay vrstva pro zachycení wheel/touch uprostřed */}
        <div
          className="absolute inset-0 z-10"
          onWheel={handleWheel}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />

        {/* Vision (kruhová dráha, opačný bod než Mission) */}
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

        {/* Mission */}
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
