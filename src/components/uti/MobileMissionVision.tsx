// src/components/uti/MobileMissionVision.tsx
import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type PanInfo,
  type MotionValue,
} from 'framer-motion';
import { useIsDesktop } from './SnapScrollContainer';

type Props = {
  t: (key: string) => string;
  className?: string;
};

const MobileMissionVision: React.FC<Props> = ({ t, className = '' }) => {
  // 🚫 Bezpečnostní brzda: na desktopu neren­derovat (PC má snap scroll)
  const isDesktop = useIsDesktop();
  if (isDesktop) return null;

  // 0 = mission, 1 = vision
  const [index, setIndex] = useState<0 | 1>(0);

  // Hladký "progres" 0..1 (fáze rotace)
  const progress = useMotionValue<number>(index);
  const smooth: MotionValue<number> = useSpring(progress, {
    stiffness: 260,
    damping: 28,
    mass: 0.6,
  });

  // 3D orbit parametry
  const R_PX = 120;
  const MAX_TILT = 28;
  const BASE_SCALE = 0.9;
  const DEPTH_SCALE = 0.12;
  const BACK_BLUR = 6;
  const FRONT_BLUR = 0;

  // Úhly a trig funkce
  const theta = useTransform(smooth, (v) => v * Math.PI);
  const mSin = useTransform(theta, (t) => Math.sin(t));
  const mCos = useTransform(theta, (t) => Math.cos(t));
  const vSin = useTransform(theta, (t) => Math.sin(t + Math.PI));
  const vCos = useTransform(theta, (t) => Math.cos(t + Math.PI));

  // Mission transforms
  const missionX = useTransform(mSin, (s) => `${s * R_PX}px`);
  // OPRAVA: Když je Mission vpředu (cos ≈ 1), nastavit scale přesně na 1.0
  const missionScale = useTransform(mCos, (c) => {
    if (c > 0.9) return 1.0; // Aktivní karta = přesně 1.0
    return BASE_SCALE + DEPTH_SCALE * (c * 0.999);
  });
  const missionOpacity = useTransform(mCos, (c) => 0.25 + 0.75 * ((c + 1) / 2)); // 0.25-1.0 místo 0.55-1.0
  const missionRotateY = useTransform(mSin, (s) => `${-s * MAX_TILT}deg`);
  
  // DOČASNĚ: Úplně odstranit blur pro debugging
  const missionBlurPx = useMotionValue(0);

  // Vision transforms
  const visionX = useTransform(vSin, (s) => `${s * R_PX}px`);
  // OPRAVA: Když je Vision vpředu (cos ≈ 1), nastavit scale přesně na 1.0
  const visionScale = useTransform(vCos, (c) => {
    if (c > 0.9) return 1.0; // Aktivní karta = přesně 1.0
    return BASE_SCALE + DEPTH_SCALE * (c * 0.999);
  });
  const visionOpacity = useTransform(vCos, (c) => 0.25 + 0.75 * ((c + 1) / 2)); // 0.25-1.0 místo 0.55-1.0
  const visionRotateY = useTransform(vSin, (s) => `${-s * MAX_TILT}deg`);
  
  // DOČASNĚ: Úplně odstranit blur pro debugging
  const visionBlurPx = useMotionValue(0);

  const missionFilter = useTransform(missionBlurPx, (b) => `blur(${b}px)`);
  const visionFilter = useTransform(visionBlurPx, (b) => `blur(${b}px)`);

  // --- Carousel ovládání ---------------------------------------------------
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStartX = useRef(0);
  const dragStartProgress = useRef(0);

  const snapTo = (target: 0 | 1) => {
    setIndex(target);
    progress.set(target); // spring hladce doběhne
  };

  const next = () => snapTo(1);
  const prev = () => snapTo(0);

  const onDragStart = (_evt: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    dragStartX.current = info.point.x;
    dragStartProgress.current = smooth.get();
  };

  const onDrag = (_evt: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const el = containerRef.current;
    if (!el) return;
    const width = Math.max(el.clientWidth, 1);
    const deltaX = info.point.x - dragStartX.current;

    // Převod posunu na změnu progressu (levý tah -> +, pravý tah -> -)
    const deltaProgress = -deltaX / width; // cca 1× šířka = 1.0 progress
    const nextVal = clamp(dragStartProgress.current + deltaProgress, 0, 1);
    progress.set(nextVal);
  };

  const onDragEnd = () => {
    const v = smooth.get();
    const target: 0 | 1 = v < 0.5 ? 0 : 1; // jednoduchý threshold
    snapTo(target);
  };

  const canPrev = index === 1;
  const canNext = index === 0;

  return (
    <div className={`relative lg:hidden ${className}`}>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center"
        style={{ height: '100svh', perspective: 1000, WebkitPerspective: 1000 }}
      >
        {/* Drag overlay (celoplošný) */}
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          onDragStart={onDragStart}
          onDrag={onDrag}
          onDragEnd={onDragEnd}
          style={{ pointerEvents: 'auto', zIndex: 5, touchAction: 'pan-y' }}
        />

        {/* Vision */}
        <motion.div
          style={{
            x: visionX,
            rotateY: visionRotateY,
            scale: visionScale,
            opacity: visionOpacity,
            filter: visionFilter,
            transformStyle: 'preserve-3d',
            zIndex: index === 1 ? 2 : 1,
          }}
          className="absolute w-full px-4"
        >
          <Card title={t('about.vision.title')} text={t('about.vision.content')} />
        </motion.div>

        {/* Mission - OPRAVENO: scale = 1.0 když je vpředu */}
        <motion.div
          style={{
            x: missionX,
            rotateY: missionRotateY,
            scale: missionScale,
            opacity: missionOpacity,
            filter: missionFilter,
            transformStyle: 'preserve-3d',
            zIndex: index === 0 ? 2 : 1,
          }}
          className="absolute w-full px-4"
        >
          <Card title={t('about.mission.title')} text={t('about.mission.content')} />
        </motion.div>

        {/* Spodní panel: šipky + tečky */}
        <div className="pointer-events-auto absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
          {/* Šipka zpět */}
          <button
            onClick={canPrev ? prev : undefined}
            aria-label="Previous"
            disabled={!canPrev}
            className={`text-2xl select-none transition ${
              canPrev ? 'opacity-100' : 'opacity-20 pointer-events-none'
            }`}
          >
            ←
          </button>

          {/* Tečky */}
          <div className="flex items-center gap-2">
            <Dot active={index === 0} onClick={() => snapTo(0)} />
            <Dot active={index === 1} onClick={() => snapTo(1)} />
          </div>

          {/* Šipka vpřed */}
          <button
            onClick={canNext ? next : undefined}
            aria-label="Next"
            disabled={!canNext}
            className={`text-2xl select-none transition ${
              canNext ? 'opacity-100' : 'opacity-20 pointer-events-none'
            }`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMissionVision;

// --- Pomocné komponenty ----------------------------------------------------

const Dot: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={active ? 'Current slide' : 'Go to slide'}
    className={`h-2.5 w-2.5 rounded-full border border-white/30 transition ${
      active ? 'bg-[#FFED29]' : 'bg-white/20 hover:bg-white/40'
    }`}
  />
);

// 📱 Tablet-friendly typografie (iPad Air apod.) přes clamp
const Card: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="mx-auto max-w-md will-change-transform">
    <h3
      className="
        font-bold text-[#FFED29] mb-4 text-center
        text-[clamp(2rem,6.8vw,2.9rem)]  /* mob → tablet */
        lg:text-4xl                         /* desktop: nerelevantní, ale bezpečné */
      "
    >
      {title}
    </h3>
    {/* DOČASNĚ: Odstraněno backdrop-blur-lg pro debugging */}
    <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10">
      <p
        className="
          leading-relaxed whitespace-pre-line
          text-[clamp(1rem,3.8vw,1.4rem)]  /* mob → tablet čitelnější */
          lg:text-lg
        "
      >
        {text}
      </p>
    </div>
  </div>
);

// --- Utils -----------------------------------------------------------------
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}