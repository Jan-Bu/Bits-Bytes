// src/components/uti/MobileMissionVision.tsx
import React, { useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useIsDesktop } from './SnapScrollContainer';

type Props = {
  t: (key: string) => string;
  className?: string;
};

const MobileMissionVision: React.FC<Props> = ({ t, className = '' }) => {
  const isDesktop = useIsDesktop();
  if (isDesktop) return null;

  const [index, setIndex] = useState<0 | 1>(0);

  const progress = useMotionValue<number>(index);
  const smooth: MotionValue<number> = useSpring(progress, {
    stiffness: 260,
    damping: 28,
    mass: 0.6,
  });

  const R_PX = 120;
  const MAX_TILT = 28;
  const BASE_SCALE = 0.9;
  const DEPTH_SCALE = 0.12;

  const theta = useTransform(smooth, (v) => v * Math.PI);
  const mSin = useTransform(theta, (t) => Math.sin(t));
  const mCos = useTransform(theta, (t) => Math.cos(t));
  const vSin = useTransform(theta, (t) => Math.sin(t + Math.PI));
  const vCos = useTransform(theta, (t) => Math.cos(t + Math.PI));

  const missionX = useTransform(mSin, (s) => `${s * R_PX}px`);
  const missionScale = useTransform(mCos, (c) => (c > 0.9 ? 1.0 : BASE_SCALE + DEPTH_SCALE * (c * 0.999)));
  const missionOpacity = useTransform(mCos, (c) => 0.1 + 0.9 * ((c + 1) / 2));
  const missionRotateY = useTransform(mSin, (s) => `${-s * MAX_TILT}deg`);

  const visionX = useTransform(vSin, (s) => `${s * R_PX}px`);
  const visionScale = useTransform(vCos, (c) => (c > 0.9 ? 1.0 : BASE_SCALE + DEPTH_SCALE * (c * 0.999)));
  const visionOpacity = useTransform(vCos, (c) => 0.1 + 0.9 * ((c + 1) / 2));
  const visionRotateY = useTransform(vSin, (s) => `${-s * MAX_TILT}deg`);

  const missionBlurPx = useMotionValue(0);
  const visionBlurPx = useMotionValue(0);
  const missionFilter = useTransform(missionBlurPx, (b) => `blur(${b}px)`);
  const visionFilter = useTransform(visionBlurPx, (b) => `blur(${b}px)`);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const snapTo = (target: 0 | 1) => {
    setIndex(target);
    progress.set(target);
  };
  const next = () => snapTo(1);
  const prev = () => snapTo(0);

  const tapToggle = () => snapTo(index === 0 ? 1 : 0);

  const canPrev = index === 1;
  const canNext = index === 0;

  return (
    <div className={`relative lg:hidden overflow-x-hidden ${className}`}>
      <div
        ref={containerRef}
        className="relative flex items-center justify-center overflow-x-hidden"
        style={{ height: '100svh', perspective: 1000, WebkitPerspective: 1000 }}
      >
        {/* TAP overlay – klepnutí přepne, ale neblokuje vertikální scroll */}
        <motion.button
          type="button"
          aria-label="Toggle card"
          className="absolute inset-0 z-10"
          onClick={tapToggle}
          // ✅ povol pouze pan-y → žádný horizontální swipe/scroll
          style={{ touchAction: 'pan-y', background: 'transparent' }}
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

        {/* Mission */}
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

        {/* Spodní panel: šipky + tečky (beze změny vizuálu/behavioru) */}
        <div className="pointer-events-auto absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
          <button
            onClick={canPrev ? prev : undefined}
            aria-label="Previous"
            disabled={!canPrev}
            className={`text-2xl select-none transition ${canPrev ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}
          >
            ←
          </button>

          <div className="flex items-center gap-2">
            <Dot active={index === 0} onClick={() => snapTo(0)} />
            <Dot active={index === 1} onClick={() => snapTo(1)} />
          </div>

          <button
            onClick={canNext ? next : undefined}
            aria-label="Next"
            disabled={!canNext}
            className={`text-2xl select-none transition ${canNext ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileMissionVision;

const Dot: React.FC<{ active: boolean; onClick: () => void }> = ({ active, onClick }) => (
  <button
    onClick={onClick}
    aria-label={active ? 'Current slide' : 'Go to slide'}
    className={`h-2.5 w-2.5 rounded-full border border-white/30 transition ${
      active ? 'bg-[#FFED29]' : 'bg-white/20 hover:bg-white/40'
    }`}
  />
);

const Card: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="mx-auto max-w-md will-change-transform">
    <h3 className="font-bold text-[#FFED29] mb-4 text-center text-[clamp(2rem,6.8vw,2.9rem)] lg:text-4xl">
      {title}
    </h3>
    <div className="relative bg-white/5 rounded-3xl p-5 border border-white/10">
      <p className="leading-relaxed whitespace-pre-line text-[clamp(1rem,3.8vw,1.4rem)] lg:text-lg">
        {text}
      </p>
    </div>
  </div>
);
