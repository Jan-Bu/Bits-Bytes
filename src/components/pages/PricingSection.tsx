import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface PricingSectionProps {
  t: (key: string) => string;
}

type MenuItem = { label: string; to: string };

const menuItems: MenuItem[] = [
  { label: 'HOME', to: '/' },
  { label: 'ABOUT', to: '/about' },
  { label: 'SERVICES', to: '/services' },
  { label: 'CONTACT', to: '/contact' },
  { label: 'BLOG', to: '/blog' },
  { label: 'TERMS', to: '/terms' },
  { label: 'GDPR', to: '/gdpr' },
];

const PricingSection: React.FC<PricingSectionProps> = ({ t }) => {
  const navigate = useNavigate();

  // (volitelné) zákaz zoomu, nechávám pokud jsi ho chtěl dřív
  useEffect(() => {
    let meta = document.querySelector('meta[name=viewport]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'viewport';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content','width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
  }, []);

  // Létající logo (stejné chování; jen se skryje na mobilech)
  const [logoPosition, setLogoPosition] = useState({ x: 100, y: 100 });
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let raf: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      setLogoPosition(prev => {
        const nx = prev.x + (mousePosRef.current.x - prev.x - 50) * 0.05;
        const ny = prev.y + (mousePosRef.current.y - prev.y - 50) * 0.05;
        return { x: Math.max(0, Math.min(window.innerWidth - 80, nx)),
                 y: Math.max(0, Math.min(window.innerHeight - 80, ny)) };
      });
      raf = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleNav = (to: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-no-repeat bg-center bg-cover bg-fixed
        px-3 md:px-6 py-3 md:py-4
        text-white font-jersey relative overflow-hidden
      "
      style={{ backgroundImage: "url('/pricing.txt.png')", backgroundSize: '100% 100%' }}
    >
      {/* Létající logo – na mobilech skryjeme, na desktopu beze změny */}
      <img
        src="/logo3.png"
        alt="Flying Logo"
        className="hidden sm:block"
        style={{
          position: 'fixed',
          top: `${logoPosition.y}px`,
          left: `${logoPosition.x}px`,
          width: '80px',
          height: 'auto',
          pointerEvents: 'none',
          transition: 'transform 0.05s linear',
          zIndex: 50
        }}
      />

      {/* Menu – stejné na desktopu; mobil: menší font, žádný negativní margin */}
      <header className="flex flex-col items-start z-20 relative mb-2 pt-16 md:pt-24 pl-2 md:pl-4">
        <nav
          className="
            bg-[#bdbdbd]
            flex flex-wrap items-center
            gap-1 md:gap-0
            text-sm sm:text-base md:text-3xl
            text-black rounded-md
            -ml-0 md:-ml-5
            font-jersey
          "
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={handleNav(item.to)}
              className="px-2 md:px-3 py-1 cursor-pointer hover:bg-[#000080] hover:text-white rounded-sm transition-colors"
              aria-label={`Go to ${item.label}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      {/* Obsah – desktop stejné; mobil zmenšíme texty a okraje */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-3 md:px-4">
        <section id="pricing-text" className="max-w-3xl mx-auto text-center opacity-100 translate-y-0">
          <h1 className="font-bold text-[#FFED29] font-jersey text-4xl sm:text-5xl md:text-7xl md:mb-6 mb-4">
            {t('pricing.intro.title')}
          </h1>

          <p className="text-black font-jersey text-base sm:text-xl md:text-4xl leading-relaxed whitespace-pre-line text-left md:text-center">
            {t('pricing.text')
              .split(' ')
              .map((word, index) =>
                word.toLowerCase().includes('websites') ? (
                  <span key={index} style={{ color: '#8A2BE2', fontWeight: 'bold' }}>
                    {word}{' '}
                  </span>
                ) : (
                  word + ' '
                )
              )}
          </p>
        </section>
      </main>
    </div>
  );
};

export default PricingSection;
