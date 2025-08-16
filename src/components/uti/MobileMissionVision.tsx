// src/components/uti/MobileMissionVision.tsx
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useSectionProgress, useIsDesktop } from './SnapScrollContainer';

type Props = {
  t: (key: string) => string;
  className?: string;
};

const MobileMissionVision: React.FC<Props> = ({ t, className = '' }) => {
  // progress (0..1) dodává výhradně SnapScrollContainer (žádná scroll logika tady)
  const progress = useSectionProgress('about-mission');
  const isDesktop = useIsDesktop();

  // převedeme číslo na MotionValue kvůli plynulosti animací
  const p = useMotionValue(progress);
  p.set(progress);

  // jemnější průběh + jarní vyhlazení
  const eased = useTransform(p, (v) => {
    const u = v < 0 ? 0 : v > 1 ? 1 : v;
    return u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  });
  const smooth = useSpring(eased, { stiffness: 300, damping: 26, mass: 0.6 });

  // 3D orbit parametry
  const theta = useTransform(smooth, (v) => v * Math.PI);

  const mSin = useTransform(theta, (t) => Math.sin(t));
  const mCos = useTransform(theta, (t) => Math.cos(t));
  const vSin = useTransform(theta, (t) => Math.sin(t + Math.PI));
  const vCos = useTransform(theta, (t) => Math.cos(t + Math.PI));

  const R_PX = 120;
  const MAX_TILT = 28;
  const BASE_SCALE = 0.9;
  const DEPTH_SCALE = 0.12;
  const BACK_BLUR = 6;
  const FRONT_BLUR = 0;

  // Mission transforms
  const missionX = useTransform(mSin, (s) => `${s * R_PX}px`);
  const missionScale = useTransform(mCos, (c) => BASE_SCALE + DEPTH_SCALE * (c * 0.999));
  const missionOpacity = useTransform(mCos, (c) => 0.55 + 0.45 * ((c + 1) / 2));
  const missionRotateY = useTransform(mSin, (s) => `${-s * MAX_TILT}deg`);
  const missionBlurPx = useTransform(mCos, (c) => {
    const t = (c + 1) / 2;
    return FRONT_BLUR + (1 - t) * BACK_BLUR;
  });

  // Vision transforms
  const visionX = useTransform(vSin, (s) => `${s * R_PX}px`);
  const visionScale = useTransform(vCos, (c) => BASE_SCALE + DEPTH_SCALE * (c * 0.999));
  const visionOpacity = useTransform(vCos, (c) => 0.55 + 0.45 * ((c + 1) / 2));
  const visionRotateY = useTransform(vSin, (s) => `${-s * MAX_TILT}deg`);
  const visionBlurPx = useTransform(vCos, (c) => {
    const t = (c + 1) / 2;
    return FRONT_BLUR + (1 - t) * BACK_BLUR;
  });

  const missionFilter = useTransform(missionBlurPx, (b) => `blur(${b}px)`);
  const visionFilter = useTransform(visionBlurPx, (b) => `blur(${b}px)`);

  // === Stav animace a správné zobrazení karet ===
  const lastEdgeRef = useRef<'start' | 'end' | null>(null);
  const [currentCard, setCurrentCard] = useState<'mission' | 'vision'>('mission');
  const holdTimeRef = useRef<number>(0);
  const lastCardChangeRef = useRef<number>(0);
  const scrollAttemptCountRef = useRef<number>(0);
  const lastScrollAttemptRef = useRef<number>(0);
  const HOLD_DURATION = 3000; // 3 sekundy držení na kraji před povolením scrollu
  const CARD_CHANGE_DELAY = 2000; // 2 sekundy po změně karty před povolením scrollu
  const REQUIRED_SCROLL_ATTEMPTS = 4; // počet scrollů potřebných k opuštění sekce
  const SCROLL_ATTEMPT_TIMEOUT = 1000; // timeout mezi pokusy o scroll (1 sekunda)

  useEffect(() => {
    // Na desktopu tuto logiku nepotřebujeme
    if (isDesktop) return;

    // Listener pro detekci pokusů o scroll
    const handleTouchStart = (e: Event) => {
      const touchEvent = e as TouchEvent;
      const now = performance.now();
      const progress = smooth.get();
      
      // Pouze když jsme na krajích sekce
      if (progress <= 0.02 || progress >= 0.98) {
        // Reset počítadla pokud uplynul timeout
        if (now - lastScrollAttemptRef.current > SCROLL_ATTEMPT_TIMEOUT) {
          scrollAttemptCountRef.current = 0;
        }
        
        lastScrollAttemptRef.current = now;
        scrollAttemptCountRef.current++;
        
        console.log(`Scroll pokus ${scrollAttemptCountRef.current}/${REQUIRED_SCROLL_ATTEMPTS}`);
      }
    };

    // Přidání touch listeneru
    const sectionEl = document.querySelector('#about-mission');
    if (sectionEl) {
      sectionEl.addEventListener('touchstart', handleTouchStart, { passive: true });
    }

    const unsubscribe = smooth.on('change', (v) => {
      const now = performance.now();
      
      // Hranice s delší hysteréz pro stabilnější detekci
      const AT_START = v <= 0.02;  // ~2%
      const AT_END = v >= 0.98;    // ~98%
      const IN_MIDDLE = v > 0.15 && v < 0.85; // střední pásmo

      // Určení aktuální karty podle pozice
      const newCard = v < 0.5 ? 'mission' : 'vision';
      if (newCard !== currentCard) {
        setCurrentCard(newCard);
        lastCardChangeRef.current = now; // Zaznamenej čas změny karty
      }

      // Reset uprostřed (když odjedeme z okraje)
      if (IN_MIDDLE && lastEdgeRef.current !== null) {
        lastEdgeRef.current = null;
        holdTimeRef.current = 0;
        scrollAttemptCountRef.current = 0; // Reset počítadla scrollů
      }

      const sectionEl = document.querySelector('#about-mission');
      if (!sectionEl) return;

      // Kontrola, zda už uplynula doba od změny karty
      const timeSinceCardChange = now - lastCardChangeRef.current;
      const cardChangeBlocksScroll = timeSinceCardChange < CARD_CHANGE_DELAY;
      
      // Kontrola počtu scroll pokusů
      const hasEnoughScrollAttempts = scrollAttemptCountRef.current >= REQUIRED_SCROLL_ATTEMPTS;

      // Detekce dosažení kraje
      if (AT_START && lastEdgeRef.current !== 'start') {
        lastEdgeRef.current = 'start';
        holdTimeRef.current = now;
        
        // Povolení scrollu nahoru pouze pokud jsou splněny všechny podmínky
        if (!cardChangeBlocksScroll && hasEnoughScrollAttempts) {
          sectionEl.dispatchEvent(new Event('mission:allow-snap', { bubbles: true }));
          scrollAttemptCountRef.current = 0; // Reset po úspěšném opuštění
        }
      } else if (AT_END && lastEdgeRef.current !== 'end') {
        lastEdgeRef.current = 'end';
        holdTimeRef.current = now;
        
        // Časované povolení scrollu dolů s kontrolou scroll pokusů
        const totalDelay = Math.max(HOLD_DURATION, timeSinceCardChange < CARD_CHANGE_DELAY ? CARD_CHANGE_DELAY - timeSinceCardChange : 0);
        setTimeout(() => {
          if (lastEdgeRef.current === 'end' && hasEnoughScrollAttempts) {
            sectionEl.dispatchEvent(new Event('mission:allow-snap', { bubbles: true }));
            scrollAttemptCountRef.current = 0; // Reset po úspěšném opuštění
          }
        }, totalDelay);
      }

      // Prodloužené držení na konci pro čtení + dodatečné čekání po změně karty + scroll pokusy
      if (AT_END && lastEdgeRef.current === 'end' && holdTimeRef.current > 0) {
        const timeHeld = now - holdTimeRef.current;
        const timeNeeded = Math.max(HOLD_DURATION, CARD_CHANGE_DELAY);
        if (timeHeld >= timeNeeded && !cardChangeBlocksScroll && hasEnoughScrollAttempts) {
          sectionEl.dispatchEvent(new Event('mission:allow-snap', { bubbles: true }));
          scrollAttemptCountRef.current = 0; // Reset po úspěšném opuštění
        }
      }
    });

    return () => {
      unsubscribe();
      if (sectionEl) {
        sectionEl.removeEventListener('touchstart', handleTouchStart);
      }
    };
  }, [smooth, isDesktop, currentCard]);

  // Na desktopu se tato komponenta nepoužívá, takže můžeme vrátit null
  if (isDesktop) {
    return null;
  }

  return (
    <div className={`lg:hidden relative h-[240svh] ${className}`}>
      <div
        className="sticky top-0 flex items-center justify-center"
        style={{ height: '100svh', perspective: 1000, WebkitPerspective: 1000 }}
      >
        {/* Vision */}
        <motion.div
          style={{
            x: visionX,
            rotateY: visionRotateY,
            scale: visionScale,
            opacity: visionOpacity,
            filter: visionFilter,
            transformStyle: 'preserve-3d',
            zIndex: currentCard === 'vision' ? 2 : 1,
          }}
          className="absolute w-full px-4"
        >
          <Card 
            title={t('about.vision.title')} 
            text={t('about.vision.content')} 
          />
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
            zIndex: currentCard === 'mission' ? 2 : 1,
          }}
          className="absolute w-full px-4"
        >
          <Card 
            title={t('about.mission.title')} 
            text={t('about.mission.content')} 
          />
        </motion.div>
      </div>
    </div>
  );
};

export default MobileMissionVision;

const Card: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="mx-auto max-w-md will-change-transform">
    <h3 className="text-4xl font-bold text-[#FFED29] mb-4 text-center">{title}</h3>
    <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-5 border border-white/10">
      <p className="text-lg leading-relaxed whitespace-pre-line">{text}</p>
    </div>
  </div>
);