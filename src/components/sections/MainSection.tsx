import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { MenuSection } from '../../types';
import AboutSection from './AboutSection';
import ServicesSection from './ServicesSection';
import PricingSection from './PricingSection';
import BlogSection from './BlogSection';
import ContactSection from './ContactSection';
import TermsSection from './TermsSection';
import GDPRSection from './GDPRSection';



const MainSection: React.FC = () => {
  const { t } = useTranslation();

  const [currentSection, setCurrentSection] = useState<MenuSection>('home');
  const [pendingSection, setPendingSection] = useState<MenuSection | null>(null);
  const [showDiskAnimation, setShowDiskAnimation] = useState(false);
  const [diskImage, setDiskImage] = useState('/diskette.png');

  useEffect(() => {
    document.body.style.overflow = currentSection === 'about' ? 'auto' : 'hidden';
    return () => {
      document.body.style.overflow = 'auto'; // fallback
    };
  }, [currentSection]);

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
      home: '/disk_home.png'
    };

    setDiskImage(diskMap[section] || '/diskette.png');

    setTimeout(() => {
      setShowDiskAnimation(true);
      setTimeout(() => {
        setShowDiskAnimation(false);
        setCurrentSection(section);
        setPendingSection(null);
      }, 1500);
    }, 300);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'about':
        return <AboutSection t={t} />;
      case 'services':
        return <ServicesSection t={t} />;
      case 'pricing':
        return <PricingSection t={t} />;
      case 'blog':
        return <BlogSection t={t} />;
      case 'contact':
        return <ContactSection t={t} />;
      case 'terms':
        return <TermsSection t={t} />;
      case 'gdpr':
        return <GDPRSection t={t} />;
      default:
        return null; // První zobrazení bez obsahu
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white">
      {/* Pozadí */}
      <img
        src="/background_main.png"
        alt="Main Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Viditelné diskety pouze pokud jsme na 'home' */}
      {currentSection === 'home' && (
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

      {/* Render cílové sekce */}
      <main className="relative z-10">{renderCurrentSection()}</main>
    </div>
  );
};

export default MainSection;
