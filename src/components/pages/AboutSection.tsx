// src/components/about/AboutSection.tsx
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'interaction-prompt'?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SnapScrollContainer, { type SnapScrollHandle, useIsDesktop } from '../uti/SnapScrollContainer';
import { IdeaToRealityBar } from '../uti/IdeaToRealityBar';
import MobileMissionVision from '../uti/MobileMissionVision';

interface AboutSectionProps {
  t: (key: string) => string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ t }) => {
  const [visibleSections, setVisibleSections] = useState(new Set<string>());
  const [anvilHintVisible, setAnvilHintVisible] = useState(true);
  const navigate = useNavigate();

  // Ref na SnapScrollContainer pro jumpTo
  const snapRef = useRef<SnapScrollHandle>(null);

  // === TEAM scroll reveal ===
  const teamRef = useRef(null);
  const isInView = useInView(teamRef, { once: false, amount: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) setHasAnimated(true);
  }, [isInView, hasAnimated]);

  const playSound = () => {
    const audio = new Audio('/sounds/boink.mp3');
    audio.play();
  };

  // IntersectionObserver pro fade-in sekcí
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, (entry.target as HTMLElement).id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <SnapScrollContainer
      ref={snapRef}
      className="relative overflow-y-auto text-white font-jersey overscroll-contain h-[calc(var(--vh,1vh)*100)] md:h-screen"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* FIXED background */}
      <div
        className="
          fixed inset-0 -z-10
          w-screen h-[calc(var(--vh,1vh)*100)] md:h-screen
          pointer-events-none
        "
        style={{
          background:
            'radial-gradient(circle at center, #231466ff 0%, #130b2eff 40%, #090510ff 80%, #000000 100%)',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 50%',
          backgroundSize: 'cover',
        }}
      />

      {/* === INTRO SECTION === */}
      <section
        id="about-intro"
        data-animate
        className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000
          ${visibleSections.has('about-intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}
      >
        {/* Nadpis + text */}
        <div className="container mx-auto px-6 text-center translate-y-[3vh] md:translate-y-[2vh] lg:translate-y-0">
          <h1
            className="font-bold text-[#FFED29]
                       text-[clamp(2.5rem,8vw,10rem)]
                       leading-[0.95]"
            style={{
              textShadow: `
                calc(clamp(2px, 0.8vw, 25px) * -1)
                calc(clamp(2px, 0.8vw, 25px) * -1)
                0 #000,
                calc(clamp(4px, 1.6vw, 50px) * -1)
                calc(clamp(4px, 1.6vw, 50px) * -1)
                0 rgba(0, 0, 0, 0.4)
              `,
            }}
          >
            {t('about.intro.title')}
          </h1>

          <p
            className="mt-2 max-w-4xl mx-auto whitespace-pre-line"
            style={{ fontSize: 'clamp(1rem, 3vmin, 2.25rem)', lineHeight: '1.35' }}
          >
            {t('about.intro.content')}
          </p>
        </div>

        {/* Panáček (GIF šipka) */}
        <div className="mt-6 md:mt-10 translate-y-[10vh] md:translate-y-[10vh]">
          <img
            src="/Bits_arrow.gif"
            alt="Arrow Down"
            className="object-contain cursor-pointer select-none"
            style={{ width: 'clamp(140px, 20vmin, 320px)', height: 'clamp(140px, 20vmin, 320px)' }}
            onClick={() => {
              playSound();
              snapRef.current?.jumpTo('about-skills');
            }}
          />
        </div>
      </section>

      {/* === SKILLS === */}
      <section
        id="about-skills"
        data-animate
        className={`min-h-screen flex items-center justify-center px-6 transition-all duration-1000 delay-100
          ${visibleSections.has('about-skills') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}
      >
        {/* === MOBILE (<md) layout — přesný fit do viewportu === */}
        <div
          className="
            md:hidden w-full max-w-7xl
            grid gap-2
            h-[90svh]            /* = 100% reálné výšky viewportu i na iOS */
            grid-rows-[53%_15%_6%_20%]  /* text / duo / nudle / 3D */
          "
        >
          {/* 1) TEXT FULL */}
          <div className="bg-black backdrop-blur-lg rounded-3xl border border-white/10 px-6 py-3 h-full">
            <h2 className="text-[clamp(2.1rem,8vw,2.8rem)] font-bold text-yellow-300 leading-tight">
              {t('about.skills.title')}
            </h2>
            <p className="mt-2 text-[clamp(1rem,4.5vw,1.3rem)] whitespace-pre-line leading-relaxed text-white">
              {t('about.skills.content')}
            </p>
          </div>

          {/* 2) ŘÁDEK: LEVO PC.gif, PRAVO VIDEO */}
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* PC.gif (left) */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black h-full">
              <img src="/PC.gif" alt="Computer Animation" className="w-full h-full object-contain" />
            </div>
            {/* VIDEO (right) */}
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black h-full">
              <video
                src="/videos/catalog.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* 3) DLOUHÁ NUDLE — PROGRESS */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black h-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-full">
                <IdeaToRealityBar />
              </div>
            </div>
          </div>

          {/* 4) 3D MODEL FULL WIDTH */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black flex items-center justify-center h-full">
            <model-viewer
              src="/anvil.glb"
              alt="Anvil 3D Model"
              auto-rotate
              camera-controls
              disable-zoom
              interaction-prompt="none"
              style={{ width: 'clamp(120px,50vw,220px)', height: 'clamp(120px,50vw,220px)' }}
              onPointerDown={() => {
                setAnvilHintVisible(false);
                setTimeout(() => setAnvilHintVisible(true), 5000);
              }}
            />
            <p
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFED29] font-bold
                         text-[clamp(0.9rem,3.5vw,1.1rem)] select-none"
              style={{ writingMode: 'vertical-lr' }}
            >
              {t('about.skills.anvil')}
            </p>
            {anvilHintVisible && (
              <div className="absolute z-20 pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <img src="/mouse.png" alt="Drag Hint" className="w-[clamp(28px,9vw,44px)] h-[clamp(28px,9vw,44px)]" />
              </div>
            )}
          </div>
        </div>

        {/* === DESKTOP/TABLET (md+): původní layout === */}
        <div
          className="
            hidden md:grid
            grid-cols-2 gap-[1rem] max-w-7xl w-full items-stretch
            md:gap-[clamp(0.75rem,1.2vw,1rem)]
          "
        >
          {/* LEVÝ TEXT BOX */}
          <div
            className="
              bg-black backdrop-blur-lg rounded-3xl px-16 py-6 border border-white/10
              flex flex-col justify-center gap-4 h-full
              md:px-[clamp(1.25rem,4vw,3.5rem)]
              md:py-[clamp(0.75rem,2vw,1.25rem)]
              md:gap-[clamp(0.5rem,1.2vw,1rem)]
            "
          >
            <h2
              className="
                text-5xl md:text-6xl font-bold text-yellow-300 leading-tight
                md:text-[clamp(2.25rem,4vw,3.75rem)]
              "
            >
              {t('about.skills.title')}
            </h2>
            <p
              className="
                text-3xl whitespace-pre-line leading-relaxed text-white
                md:text-[clamp(1.125rem,2.2vw,1.875rem)]
              "
            >
              {t('about.skills.content')}
            </p>
          </div>

          {/* PRAVÁ STRANA: Bento 2×2 */}
          <div
            className="
              grid grid-cols-2 grid-rows-2 gap-[1rem]
              md:gap-[clamp(0.5rem,1vw,1rem)]
            "
          >
            {/* Box A — levý sloupec, přes 2 řádky */}
            <div
              className="
                row-span-2 bg-white/10 backdrop-blur-lg rounded-3xl p-0 border border-white/10
                h-[480px] w-full overflow-hidden
                md:h-[clamp(360px,50vw,480px)]
                lg:h-[480px]
              "
            >
              <video
                src="/videos/catalog.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Box B — horní řádek s kovadlinou */}
            <div
              className="
                relative bg-black backdrop-blur-lg rounded-3xl border border-white/10
                h-full flex items-center justify-center p-4 overflow-hidden
                md:p-[clamp(0.5rem,1.2vw,1rem)]
              "
            >
              <model-viewer
                src="/anvil.glb"
                alt="Anvil 3D Model"
                auto-rotate
                camera-controls
                disable-zoom
                interaction-prompt="none"
                style={{ width: 'clamp(90px,9vw,120px)', height: 'clamp(90px,9vw,120px)' }}
                onPointerDown={() => {
                  setAnvilHintVisible(false);
                  setTimeout(() => setAnvilHintVisible(true), 5000);
                }}
              />
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <p
                  className="
                    text-[#FFED29] text-4xl font-bold select-none
                    md:text-[clamp(1.25rem,2.8vw,2.5rem)]
                  "
                  style={{ writingMode: 'vertical-lr' }}
                >
                  {t('about.skills.anvil')}
                </p>
              </div>
              {anvilHintVisible && (
                <div className="absolute z-20 pointer-events-none animate-wiggle left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <img
                    src="/mouse.png"
                    alt="Drag Hint"
                    className="w-12 h-12 md:w-[clamp(32px,4vw,48px)] md:h-[clamp(32px,4vw,48px)]"
                  />
                </div>
              )}
            </div>

            {/* Box B — dolní řádek */}
            <div className="row-span-2 h-full w-full overflow-hidden rounded-3xl bg-black">
              <img
                src="/PC.gif"
                alt="Computer Animation"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Box A — pravý sloupec, přes 2 řádky */}
            <div className="h-full w-full overflow-hidden rounded-3xl bg-black">
              <IdeaToRealityBar />
            </div>
          </div>
        </div>
      </section>

      {/* === MISSION + VISION === */}
      <MissionVisionWrapper t={t} visibleSections={visibleSections} />

      {/* TEAM */}
      <section
        ref={teamRef}
        id="about-team"
        data-animate
        className="relative overflow-hidden text-center
             min-h-[100svh] md:min-h-screen
             flex flex-col"
      >
        {/* Žlutý panel container - flex-1 aby zabral většinu místa */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-32">
          <motion.div
            initial={{ x: '150vw', y: '-10%' }}
            animate={
              hasAnimated
                ? {
                  x: '0%',
                  y: '0%',
                  transition: { duration: 1, ease: [0.9, 0.05, 0.15, 0.95] },
                }
                : {}
            }
            className="w-full"
          >
            {/* ROTATED WRAPPER s bílým rámečkem */}
            <div className="relative w-full origin-center -rotate-[3deg] sm:-rotate-[2deg] md:-rotate-[3deg]">
              {/* ŽLUTÝ PANEL s bílým rámečkem a černým outline */}
              <div
                className="relative left-[-25%] w-[150%] bg-[#E6D021]
                     py-6 sm:py-12 md:py-16 lg:py-20
                     px-4 sm:px-6
                     text-black border-y-[6px] sm:border-y-[12px] md:border-y-[16px] border-white"
              >
                {/* Nadpis */}
                <h2
                  className="font-bold mb-6 sm:mb-12 md:mb-16 text-blue-700
                       text-[clamp(2rem,8vw,5rem)] sm:text-[clamp(2.5rem,7vw,6rem)]
                       md:text-6xl lg:text-8xl"
                  style={{
                    textShadow: `
                calc(clamp(8px, 2vw, 20px) * -1)
                calc(clamp(8px, 2vw, 20px) * -1)
                0 #000,
                calc(clamp(16px, 4vw, 40px) * -1)
                calc(clamp(16px, 4vw, 40px) * -1)
                0 rgba(0, 0, 0, 0.4)
              `,
                  }}
                >
                  {t('about.team.title')}
                </h2>

                {/* Postavy - responzivní layout */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-16 md:gap-32 lg:gap-64">
                  {/* Bits */}
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="relative rounded-full overflow-hidden
                              w-[clamp(110px,24vw,220px)] h-[clamp(110px,24vw,220px)]
                              sm:w-[clamp(140px,20vw,200px)] sm:h-[clamp(140px,20vw,200px)]
                              md:w-48 md:h-48 lg:w-60 lg:h-60">
                      <img
                        src="/Bits_static.png"
                        alt="Bits"
                        className="absolute inset-0 w-full h-full object-contain
                             scale-[2.0] sm:scale-[2.0] md:scale-[2.2]
                             group-hover:hidden"
                      />
                      <img
                        src="/Bits_animated.gif"
                        alt="Bits animated"
                        className="absolute inset-0 w-full h-full object-contain
                             scale-[2.0] sm:scale-[2.0] md:scale-[2.2]
                             hidden group-hover:block"
                      />
                    </div>
                    <p className="text-blue-700 font-semibold text-[clamp(0.95rem,4vw,1.5rem)] sm:text-xl md:text-2xl lg:text-3xl">
                      {t('about.team.bits')}
                    </p>
                  </div>

                  {/* Bytes */}
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="relative rounded-full overflow-hidden
                              w-[clamp(110px,24vw,220px)] h-[clamp(110px,24vw,220px)]
                              sm:w-[clamp(140px,20vw,200px)] sm:h-[clamp(140px,20vw,200px)]
                              md:w-48 md:h-48 lg:w-60 lg:h-60">
                      <img
                        src="/Byte_static.png"
                        alt="Bytes"
                        className="absolute inset-0 w-full h-full object-contain scale-[1.1] group-hover:hidden"
                      />
                      <img
                        src="/Byte_animated.gif"
                        alt="Bytes animated"
                        className="absolute inset-0 w-full h-full object-contain scale-[1.1] hidden group-hover:block"
                      />
                    </div>
                    <p className="text-blue-700 font-semibold text-[clamp(0.95rem,4vw,1.5rem)] sm:text-xl md:text-2xl lg:text-3xl">
                      {t('about.team.bytes')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tlačítka na spodku sekce */}
        <div className="px-6 pb-8 pt-4 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6">
          {/* BACK → MainSection (home) */}
          <button
            onClick={() => navigate('/')}
            className="bg-[#E6D021] hover:bg-blue-700 text-black font-bold
               py-2 px-6 sm:py-3 sm:px-8
               text-base sm:text-lg
               rounded-full shadow-lg shadow-black transition-all duration-300
               w-full sm:w-auto max-w-[200px]"
          >
            {t('about.button.back')}
          </button>

          {/* CONTACT → ContactSection */}
          <button
            onClick={() => navigate('/contact')}
            className="bg-[#E6D021] hover:bg-blue-700 text-black font-bold
               py-2 px-6 sm:py-3 sm:px-8
               text-base sm:text-lg
               rounded-full shadow-lg shadow-black transition-all duration-300
               w-full sm:w-auto max-w-[200px]"
          >
            {t('about.button.contact')}
          </button>
        </div>
      </section>
    </SnapScrollContainer>
  );
};

// Wrapper komponenta pro Mission/Vision sekci
const MissionVisionWrapper: React.FC<{
  t: (key: string) => string;
  visibleSections: Set<string>;
}> = ({ t, visibleSections }) => {
  const isDesktop = useIsDesktop();

  return (
    <section
      id="about-mission"
      data-animate
      className={`min-h-screen transition-all duration-1000 delay-200
        ${visibleSections.has('about-mission') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        ${isDesktop ? 'block lg:flex lg:items-center lg:justify-center py-16 lg:py-32' : ''}
      `}
    >
      <div className="container mx-auto px-6 max-w-6xl">
        {isDesktop ? (
          /* === DESKTOP layout (≥1024px) === */
          <div className="relative">
            <div className="grid lg:grid-cols-2 items-start" style={{ gap: '215px' }}>
              {/* Obrázek mezi boxy (jen desktop) */}
              <img
                src="/Bytes_hold.png"
                alt="Bytes Holding"
                className="absolute top-1/2 left-1/2 z-10 w-64 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              />

              {['mission', 'vision'].map((key) => (
                <div
                  key={key}
                  className="relative group flex flex-col h-full transition-all duration-500 hover:-translate-y-2"
                >
                  <h3
                    className="text-5xl md:text-7xl font-bold text-[#FFED29] mb-4 text-center"
                    style={{
                      textShadow: `
                        -15px -15px 0 #000,
                        -30px -30px 0 rgba(0, 0, 0, 0.4)
                      `,
                    }}
                  >
                    {t(`about.${key}.title`)}
                  </h3>
                  <div className="absolute inset-0 rounded-3xl blur-3xl transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#FFED29]/20 group-hover:to-pink-400/20" />
                  <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 flex-grow">
                    <p className="text-2xl leading-relaxed whitespace-pre-line">
                      {t(`about.${key}.content`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* === MOBILE layout s 3D orbit animací === */
          <MobileMissionVision t={t} />
        )}
      </div>
    </section>
  );
};

export default AboutSection;