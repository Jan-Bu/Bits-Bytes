import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

type MenuSection =
  | 'about'
  | 'services'
  | 'pricing'
  | 'blog'
  | 'contact'
  | 'terms'
  | 'gdpr'
  | 'home';

const MainSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [pendingSection, setPendingSection] = useState<MenuSection | null>(null);
  const [showDiskAnimation, setShowDiskAnimation] = useState(false);
  const [flashOn, setFlashOn] = useState(false); // CRT flash/overlay
  const [ledOn, setLedOn] = useState(false);     // LED mechaniky (červená)
  const [diskImage, setDiskImage] = useState('/diskette.png');

  // ==== LED a CRT okno (doladíš pozice podle svého backgroundu) ====
  const LED = {
    top: '56.5%',
    left: '60%',
    size: 10,
  };

  const SCREEN = {
    top: '29%',
    left: '44.5%',
    width: '23%',
    height: '26%',
  };

  const handleNavigation = (section: MenuSection) => {
    setPendingSection(section);

    const diskMap: Record<MenuSection, string> = {
      about: '/disk_about.png',
      services: '/disk_services.png',
      pricing: '/disk_pricing.png',
      blog: '/disk_blog.png',
      contact: '/disk_contact.png',
      terms: '/disk_terms.png',
      gdpr: '/disk_gdpr.png',
      home: '/disk_home.png',
    };

    const routeMap: Record<MenuSection, string> = {
      about: '/about',
      services: '/services',
      pricing: '/pricing',
      blog: '/blog',
      contact: '/contact',
      terms: '/terms',
      gdpr: '/gdpr',
      home: '/',
    };

    setDiskImage(diskMap[section] || '/diskette.png');

    // Spustí animaci diskety
    setTimeout(() => {
      setShowDiskAnimation(true);

      // LED a flash až na konci pohybu diskety (po ~1s)
      setTimeout(() => {
        setLedOn(true);
        setFlashOn(true);
        setTimeout(() => setFlashOn(false), 1500);
        setTimeout(() => setLedOn(false), 500);
      }, 1000);

      // Po dokončení všeho přechod na stránku
      setTimeout(() => {
        setShowDiskAnimation(false);
        setPendingSection(null);
        navigate(routeMap[section]);
      }, 1500);
    }, 300);
  };

  // === Pomocná komponenta pro jednu disketu (hover + neon přes drop-shadow) ===
  const DiskButton: React.FC<{
    section: MenuSection;
    src: string;
    posClass: string;        // např. "top-[18%] right-[5%] w-48"
    isActive?: boolean;      // když true → pulzující neon
  }> = ({ section, src, posClass, isActive }) => (
    <motion.div
      className={`absolute ${posClass} z-10 cursor-pointer`}
      onClick={() => handleNavigation(section)}
      initial={false}
      whileHover={{ y: -8 }}
      whileTap={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      style={{ willChange: 'transform' }}
    >
      <motion.img
        src={src}
        alt={section.toUpperCase()}
        draggable={false}
        className="select-none"
        style={{
          display: 'block',
          filter: isActive
            ? `
            drop-shadow(0 0 4px #7df9ff)
            drop-shadow(0 0 8px #7df9ff)
            drop-shadow(0 0 12px #7df9ff)
          `
            : 'none',
        }}
        animate={
          isActive
            ? {
              filter: [
                `drop-shadow(0 0 4px #7df9ff) drop-shadow(0 0 8px #7df9ff) drop-shadow(0 0 12px #7df9ff)`,
                `drop-shadow(0 0 8px #7df9ff) drop-shadow(0 0 12px #7df9ff) drop-shadow(0 0 16px #7df9ff)`,
                `drop-shadow(0 0 4px #7df9ff) drop-shadow(0 0 8px #7df9ff) drop-shadow(0 0 12px #7df9ff)`,
              ],
            }
            : {}
        }
        transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
      />
    </motion.div>
  );

  const isHome = typeof window !== 'undefined' && window.location.pathname === '/';

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-hidden">
      {/* Pozadí pouze pro 'home' */}
      {isHome && (
        <img
          src="/background_main.png"
          alt="Main Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Viditelné diskety pouze na home (POZICE ZACHOVÁNY) */}
      {isHome && (
        <>
          <DiskButton section="about" src="/disk_about.png" posClass="top-[18%] right-[5%]  w-48" />
          <DiskButton section="services" src="/disk_services.png" posClass="top-[34%] right-[10%] w-48" />
          <DiskButton section="pricing" src="/disk_pricing.png" posClass="top-[34%] right-[5%]  w-48" />
          <DiskButton section="gdpr" src="/disk_gdpr.png" posClass="top-[66%] right-[5%]  w-48" />
          <DiskButton section="blog" src="/disk_blog.png" posClass="top-[50%] right-[10%] w-48" />
          <DiskButton section="contact" src="/disk_contact.png" posClass="top-[50%] right-[5%]  w-48" />
          <DiskButton section="terms" src="/disk_terms.png" posClass="top-[66%] right-[10%] w-48" />
          {/* HOME má neonový rámeček */}
          <DiskButton section="home" src="/disk_home.png" posClass="top-[18%] right-[10%] w-48" isActive />
        </>
      )}

      {/* Disketa – animace zasunutí (beze změn) */}
      {showDiskAnimation && (
        <motion.img
          src={diskImage}
          alt="Diskette"
          initial={{ y: 300, opacity: 0 }}
          animate={{ y: '-33vh', opacity: 1 }}
          exit={{ y: -200, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-[53.7%] w-48 h-48 z-30 transform -translate-x-1/2"
        />
      )}

      {/* LED mechaniky – ČERVENÁ */}
      <div
        className="absolute pointer-events-none transition-all"
        style={{
          top: LED.top,
          left: LED.left,
          width: LED.size,
          height: LED.size,
          transform: 'translate(-50%, -50%)',
          background: ledOn ? 'rgba(255, 46, 46, 0.95)' : 'rgba(70, 20, 20, 0.35)',
          boxShadow: ledOn
            ? '0 0 10px rgba(255,60,60,0.9), 0 0 20px rgba(255,60,60,0.5)'
            : 'none',
          border: '1px solid rgba(0,0,0,0.5)',
          zIndex: 25,
        }}
      />

      {/* CRT flash + LOADING… */}
      {flashOn && (
        <div
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            top: SCREEN.top,
            left: SCREEN.left,
            width: SCREEN.width,
            height: SCREEN.height,
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.35), rgba(255,255,255,0.05) 60%, rgba(0,0,0,0) 100%)',
            mixBlendMode: 'screen',
            zIndex: 15,
          }}
        >
          <div
            style={{
              padding: '6px 10px',
              fontFamily: 'monospace',
              fontSize: 'clamp(10px, 1.6vw, 18px)',
              color: '#9effa6',
              textShadow: '0 0 6px rgba(120,255,150,0.8)',
              background: 'rgba(10,25,10,0.35)',
              border: '1px solid rgba(150,255,170,0.35)',
              borderRadius: 4,
            }}
          >
            LOADING…
          </div>
        </div>
      )}
    </div>
  );
};

export default MainSection;
