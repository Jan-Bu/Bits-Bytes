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
  const [diskImage, setDiskImage] = useState('/diskette.png');

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

    setTimeout(() => {
      setShowDiskAnimation(true);
      setTimeout(() => {
        setShowDiskAnimation(false);
        setPendingSection(null);
        navigate(routeMap[section]);
      }, 1500);
    }, 300);
  };

  return (
    <div className="relative w-screen min-h-screen bg-black text-white overflow-hidden">
      {/* Pozadí pouze pro 'home' */}
      {window.location.pathname === '/' && (
        <img
          src="/background_main.png"
          alt="Main Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}

      {/* Viditelné diskety pouze pokud jsme na 'home' */}
      {window.location.pathname === '/' && (
        <>
          <img src="/disk_about.png" alt="About" className="absolute top-[18%] right-[5%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('about')} />
          <img src="/disk_services.png" alt="Services" className="absolute top-[34%] right-[10%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('services')} />
          <img src="/disk_pricing.png" alt="Pricing" className="absolute top-[34%] right-[5%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('pricing')} />
          <img src="/disk_gdpr.png" alt="GDPR" className="absolute top-[66%] right-[5%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('gdpr')} />
          <img src="/disk_blog.png" alt="Blog" className="absolute top-[50%] right-[10%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('blog')} />
          <img src="/disk_contact.png" alt="Contact" className="absolute top-[50%] right-[5%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('contact')} />
          <img src="/disk_terms.png" alt="Terms" className="absolute top-[66%] right-[10%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('terms')} />
          <img src="/disk_home.png" alt="Home" className="absolute top-[18%] right-[10%] w-48 cursor-pointer z-10" onClick={() => handleNavigation('home')} />
        </>
      )}

      {/* Zasouvání diskety */}
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

      {/* Neobsahuje obsah stránky – ty jsou oddělené v routech (AboutSection atd.) */}
    </div>
  );
};

export default MainSection;
