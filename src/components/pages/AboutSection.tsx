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
import { motion, useAnimation, useInView } from 'framer-motion';
import { IdeaToRealityBar } from '../IdeaToRealityBar';
import { useNavigate } from 'react-router-dom';

interface AboutSectionProps {
  t: (key: string) => string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ t }) => {
  const [visibleSections, setVisibleSections] = useState(new Set<string>());
  const [anvilHintVisible, setAnvilHintVisible] = useState(true);
  const navigate = useNavigate();

  // === TEAM scroll reveal ===
  const teamRef = useRef(null);
  const isInView = useInView(teamRef, { once: false, amount: 0.3 });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  const playSound = () => {
    const audio = new Audio('/sounds/boink.mp3');
    audio.play();
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach((el) =>
      observer.observe(el)
    );
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative overflow-y-auto scroll-smooth text-white font-jersey">
      {/* FIXED background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at center, #231466ff 0%, #130b2eff 40%, #090510ff 80%, #000000 100%)',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />

      {/* === INTRO SECTION === */}
      <section
        id="about-intro"
        data-animate
        className={`min-h-screen flex flex-col items-center justify-center transition-all duration-1000 ${visibleSections.has('about-intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        {/* Nadpis + text */}
        <div
          className="container mx-auto px-6 text-center translate-y-[-4vh] md:translate-y-0"
        >
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
            style={{
              fontSize: 'clamp(1rem, 3vmin, 2.25rem)',
              lineHeight: '1.35',
            }}
          >
            {t('about.intro.content')}
          </p>
        </div>

        {/* Panáček */}
        <div className="mt-6 md:mt-10 translate-y-[10vh] md:translate-y-0">
          <img
            src="/Bits_arrow.gif"
            alt="Arrow Down"
            className="object-contain cursor-pointer select-none"
            style={{
              width: 'clamp(140px, 20vmin, 320px)',
              height: 'clamp(140px, 20vmin, 320px)',
            }}
            onClick={() => {
              playSound();
              document.getElementById('about-skills')?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </div>
      </section>


      {/* === SKILLS === */}
      <section
        id="about-skills"
        data-animate
        className={`min-h-screen flex items-center justify-center px-6 transition-all duration-1000 delay-100 ${visibleSections.has('about-skills')
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="grid grid-cols-2 gap-[1rem] max-w-7xl w-full items-stretch">
          {/* === LEVÁ STRANA: Textový box === */}
          <div className="bg-black backdrop-blur-lg rounded-3xl px-16 py-6 border border-white/10 flex flex-col justify-center gap-4 h-full">
            <h2 className="text-5xl md:text-6xl font-bold text-yellow-300 leading-tight">
              {t('about.skills.title')}
            </h2>
            <p
              className="text-3xl whitespace-pre-line leading-relaxed text-white">
              {t('about.skills.content')}
            </p>
          </div>

          {/* === PRAVÁ STRANA: Bento boxy 2×2 === */}
          <div className="grid grid-cols-2 grid-rows-2 gap-[1rem]">
            {/* Box A – levý sloupec, přes 2 řádky */}
            <div className="row-span-2 bg-white/10 backdrop-blur-lg rounded-3xl p-0 border border-white/10 h-[480px] w-full overflow-hidden">
              <video
                src="/videos/catalog.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>

            {/* Box B – horní řádek s kovadlinou */}
            <div className="relative bg-black backdrop-blur-lg rounded-3xl border border-white/10 h-full flex items-center justify-center p-4 overflow-hidden">
              <model-viewer
                src="/anvil.glb"
                alt="Anvil 3D Model"
                auto-rotate
                camera-controls
                disable-zoom
                interaction-prompt="none"
                style={{ width: '120px', height: '120px' }}
                onPointerDown={() => {
                  setAnvilHintVisible(false);

                  setTimeout(() => {
                    setAnvilHintVisible(true);
                  }, 5000);
                }}
              />
              <div className="absolute top-1/2 right-2 -translate-y-1/2">
                <p
                  className="text-[#FFED29] text-4xl font-bold select-none"
                  style={{ writingMode: 'vertical-lr' }}
                >
                  {t('about.skills.anvil')}
                </p>
              </div>
              {anvilHintVisible && (
                <div className="absolute z-20 pointer-events-none animate-wiggle left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <img src="/mouse.png" alt="Drag Hint" className="w-12 h-12" />
                </div>
              )}
            </div>

            {/* Box B – dolní řádek */}
            <div className="row-span-2 h-full w-full overflow-hidden rounded-3xl bg-black">
              <img
                src="/PC.gif"
                alt="Computer Animation"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Box A – pravý sloupec, přes 2 řádky */}
            <div className="h-full w-full overflow-hidden rounded-3xl bg-black">
              <IdeaToRealityBar />
            </div>
          </div>
        </div>
      </section>



      {/* === MISSION + VISION === */}
      <section
        id="about-mission"
        data-animate
        className={`py-32 transition-all duration-1000 delay-200 ${visibleSections.has('about-mission') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div
            className="grid lg:grid-cols-2 items-start"
            style={{ gap: '215px' }}
          >

            {/* Obrázek mezi boxy */}
            <img
              src="/Bytes_hold.png"
              alt="Bytes Holding"
              className="hidden lg:block absolute top-1/2 left-1/2 z-10 w-64 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
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
      </section>

      {/* TEAM */}
      <section
        ref={teamRef}
        id="about-team"
        data-animate
        className="relative overflow-hidden py-32 px-6 text-center min-h-screen"
      >
        <motion.div
          initial={{ x: '150vw', y: '-10%' }}
          animate={
            hasAnimated
              ? {
                x: '0%',
                y: '0%',
                transition: {
                  duration: 1,
                  ease: [0.9, 0.05, 0.15, 0.95],
                },
              }
              : {}
          }
          className="absolute inset-0 z-0 flex items-center justify-center"
        >
          {/* ROTATED WRAPPER s bílým rámečkem */}
          <div className="relative w-full origin-center -rotate-[3deg]">
            {/* ŽLUTÝ PANEL s bílým rámečkem a černým outline */}
            <div
              className="relative left-[-25%] w-[150%] bg-[#E6D021] py-20 px-6 text-black 
                   border-y-[16px] border-white"
            >
              {/* Nadpis */}
              <h2
                className="text-6xl md:text-8xl font-bold mb-16 text-blue-700"
                style={{
                  textShadow: `
              -20px -20px 0 #000,
              -40px -40px 0 rgba(0, 0, 0, 0.4)
            `,
                }}
              >
                {t('about.team.title')}
              </h2>

              {/* Postavy */}
              <div className="flex flex-wrap justify-center gap-64">
                {/* Bits */}
                <div className="flex flex-col items-center gap-2 group">
                  <div className="relative w-60 h-60 rounded-full overflow-hidden">
                    <img
                      src="/Bits_static.png"
                      alt="Bits"
                      className="absolute inset-0 w-full h-full object-contain scale-[2.2] group-hover:hidden"
                    />
                    <img
                      src="/Bits_animated.gif"
                      alt="Bits animated"
                      className="absolute inset-0 w-full h-full object-contain scale-[2.2] hidden group-hover:block"
                    />
                  </div>
                  <p className="text-3xl text-blue-700 font-semibold">
                    {t('about.team.bits')}
                  </p>
                </div>

                {/* Bytes */}
                <div className="flex flex-col items-center gap-2 group">
                  <div className="relative w-60 h-60 rounded-full overflow-hidden">
                    <img
                      src="/Byte_static.png"
                      alt="Bytes"
                      className="absolute inset-0 w-full h-full object-contain scale-[1.2] group-hover:hidden"
                    />
                    <img
                      src="/Byte_animated.gif"
                      alt="Bytes animated"
                      className="absolute inset-0 w-full h-full object-contain scale-[1.2] hidden group-hover:block"
                    />
                  </div>
                  <p className="text-3xl text-blue-700 font-semibold">
                    {t('about.team.bytes')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Tlačítka pod žlutým pruhem */}
        <div className="h-[640px]" aria-hidden="true" />

        <div className="mt-[300px] flex justify-center gap-6 relative z-50">
          {/* BACK → MainSection (home) */}
          <button
            onClick={() => navigate('/')}
            className="bg-[#E6D021] hover:bg-blue-700 text-lg text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-black transition-all duration-300"
          >
            {t('about.button.back')}
          </button>

          {/* CONTACT → ContactSection */}
          <button
            onClick={() => navigate('/contact')}
            className="bg-[#E6D021] hover:bg-blue-700 text-lg text-black font-bold py-3 px-8 rounded-full shadow-lg shadow-black transition-all duration-300"
          >
            {t('about.button.contact')}
          </button>
        </div>
      </section>

    </div>
  );
};

export default AboutSection;