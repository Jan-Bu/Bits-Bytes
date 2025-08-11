import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainSection from './components/pages/MainSection';
import AboutSection from './components/pages/AboutSection';
import ServicesSection from './components/pages/ServicesSection';
import PricingSection from './components/pages/PricingSection';
import BlogSection from './components/pages/BlogSection';
import ContactSection from './components/pages/ContactSection';
import TermsSection from './components/pages/TermsSection';
import GDPRSection from './components/pages/GDPRSection';
import '@google/model-viewer';

import { useTranslation } from './hooks/useTranslation';

const AppRoutes = () => {
  const { t } = useTranslation();

  return (
    <Routes>
      <Route path="/" element={<MainSection />} />
      <Route path="/about" element={<AboutSection t={t} />} />
      <Route path="/services" element={<ServicesSection t={t} />} />
      <Route path="/pricing" element={<PricingSection t={t} />} />
      <Route path="/blog" element={<BlogSection t={t} />} />
      <Route path="/contact" element={<ContactSection t={t} />} />
      <Route path="/terms" element={<TermsSection t={t} />} />
      <Route path="/gdpr" element={<GDPRSection t={t} />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

export default App;
