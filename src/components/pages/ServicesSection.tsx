// src/components/pages/ServicesSection.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Code, Search, Palette, Printer, TrendingUp } from 'lucide-react';
import { translations } from '../../data/translations';
import ServiceCard from '../services/ServiceCard';
import { accentPresets, Accent } from '../services/theme';
import { motion, AnimatePresence } from 'framer-motion';
import RetroBrowserCard, { type ProjectItem } from '../services/RetroBrowserCard';
import type { AppId } from '../desktop/types';

type Props = {
  t: (key: string) => string;
  lang?: 'cs' | 'en';
  embedded?: boolean;
  onRequestClose?: () => void;
  onOpenApp?: (id: AppId) => void;
  onOpenWeb?: (url: string, title?: string) => void;
};

const NAV_BG = 'rgb(17 24 39)'; // Tailwind bg-gray-900 (#111827)

const ServicesSection: React.FC<Props> = ({ t, lang = 'en', embedded = false, onOpenApp, onOpenWeb }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'hero' | 'web' | 'seo' | 'branding' | 'print'>('hero');

  // === vnitřní skrolovací kontejner jen při embedded ===
  const scrollerRef = useRef<HTMLDivElement>(null);

  // --- typewriter headline in HERO ---
  const fullHeadline = t('ServicesSection.hero.headline');
  const [typedHeadline, setTypedHeadline] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const [typingStarted, setTypingStarted] = useState(false);
  const h1BoxRef = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const [caretStartLeft, setCaretStartLeft] = useState<number | null>(null);

  // 🔒 Vypnout horizontální scroll jen na této stránce
  useEffect(() => {
    const prevBody = document.body.style.overflowX;
    const prevHtml = document.documentElement.style.overflowX;

    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowX = 'hidden';

    return () => {
      document.body.style.overflowX = prevBody;
      document.documentElement.style.overflowX = prevHtml;
    };
  }, []);

  // --- top navigation items (lokální sekce) ---
  const menuItems = [
    { label: t('nav.home') || 'Home', id: 'hero' },
    { label: t('nav.services') || 'Services', id: 'web' },
    { label: t('nav.pricing') || 'SEO', id: 'seo' },
    { label: t('nav.about') || 'Branding', id: 'branding' },
    { label: t('nav.contact') || 'Print', id: 'print' },
  ];

  // Caret start
  useEffect(() => {
    if (typingStarted) return;
    const boxEl = h1BoxRef.current;
    const ghostEl = ghostRef.current;
    if (!boxEl || !ghostEl || !fullHeadline) return;
    const tn = ghostEl.firstChild;
    if (!tn || tn.nodeType !== Node.TEXT_NODE) return;
    const range = document.createRange();
    range.setStart(tn, 0);
    range.setEnd(tn, 1);
    const rects = range.getClientRects();
    if (rects.length) {
      const r = rects[0];
      const boxRect = boxEl.getBoundingClientRect();
      setCaretStartLeft(r.left - boxRect.left);
    } else {
      setCaretStartLeft(null);
    }
  }, [fullHeadline, typingStarted]);

  // Typing effect
  useEffect(() => {
    const start = setTimeout(() => {
      setTypingStarted(true);
      let i = 0;
      const int = setInterval(() => {
        i += 1;
        setTypedHeadline(fullHeadline.slice(0, i));
        if (i >= fullHeadline.length) { clearInterval(int); setTypingDone(true); }
      }, 120);
    }, 800);
    return () => clearTimeout(start);
  }, [fullHeadline]);

  // Showcase items for WEB section (from translations object)
  const showcaseItems = useMemo<ProjectItem[]>(() => {
    const s = ((translations as any)[lang]?.ServicesSection?.web?.showcase ?? {}) as Record<
      string,
      { title: string; note?: string; href?: string; preview?: string }
    >;
    return Object.values(s);
  }, [lang]);

  // === Scroll spy – používáme buď window, nebo vnitřní scroller ===
  useEffect(() => {
    const onScroll = () => {
      const ids = ['hero', 'web', 'seo', 'branding', 'print'] as const;
      const y = (embedded ? (scrollerRef.current?.scrollTop ?? 0) : window.scrollY) + 120;

      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const { offsetTop, offsetHeight } = el;
        if (y >= offsetTop && y < offsetTop + offsetHeight) { setActiveSection(id); break; }
      }
    };

    if (embedded && scrollerRef.current) {
      const root = scrollerRef.current;
      root.addEventListener('scroll', onScroll, { passive: true } as any);
      onScroll();
      return () => root.removeEventListener('scroll', onScroll as any);
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      return () => window.removeEventListener('scroll', onScroll);
    }
  }, [embedded]);

  // Smooth scroll s ohledem na sticky navbar v embed režimu
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    setIsMenuOpen(false);

    if (embedded && scrollerRef.current) {
      const root = scrollerRef.current;
      const target = el.offsetTop - (root.clientHeight - el.offsetHeight) / 2;
      root.scrollTo({ top: target, behavior: 'smooth' });
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY;
      const target = y - (window.innerHeight - el.offsetHeight) / 2;
      window.scrollTo({ top: target, behavior: 'smooth' });
    }
  };

  const sectionMin = embedded ? 'min-h-[100%]' : 'min-h-screen';
  const sectionPad = 'py-24 md:py-32';

  return (
    <div className="relative w-full h-full overflow-x-hidden">
      {/* vnitřní scroller jen při embedded */}
      <div
        ref={scrollerRef}
        className={embedded ? 'absolute inset-0 overflow-y-auto overflow-x-hidden' : undefined}
      >
        {/* 🔒 Lokální pozadí: jen uvnitř okna */}
        <div className="relative min-h-full text-white overflow-x-hidden">
          <div
            className="pointer-events-none absolute inset-0 -z-10"
            style={{ backgroundColor: NAV_BG, backgroundImage: 'none' }}
          />

          {/* ===== DOT-NAV OVERLAY – vždy uprostřed okna ===== */}
          {embedded ? (
            <div className="sticky top-1/2 -translate-y-1/2 z-40 h-0">
              <div className="relative">
                <div className="absolute right-4 pointer-events-auto hidden lg:block">
                  <div className="flex flex-col space-y-3">
                    {[
                      { id: 'hero', a: 'green' as Accent, label: 'HOME' },
                      { id: 'web', a: 'green' as Accent, label: 'WEB' },
                      { id: 'seo', a: 'pink' as Accent, label: 'SEO' },
                      { id: 'branding', a: 'blue' as Accent, label: 'BRAND' },
                      { id: 'print', a: 'purple' as Accent, label: 'PRINT' },
                    ].map((it) => (
                      <button
                        key={it.id}
                        onClick={() => scrollToSection(it.id)}
                        className={[
                          'w-3 h-3 border-2 transition-all duration-300 rounded-full',
                          accentPresets[it.a].ring,
                          activeSection === it.id ? `${accentPresets[it.a].dotBg} scale-150` : `${accentPresets[it.a].dotBgHover50}`,
                        ].join(' ')}
                        title={it.label}
                        aria-label={it.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
              <div className="flex flex-col space-y-3">
                {[
                  { id: 'hero', a: 'green' as Accent, label: 'HOME' },
                  { id: 'web', a: 'green' as Accent, label: 'WEB' },
                  { id: 'seo', a: 'pink' as Accent, label: 'SEO' },
                  { id: 'branding', a: 'blue' as Accent, label: 'BRAND' },
                  { id: 'print', a: 'purple' as Accent, label: 'PRINT' },
                ].map((it) => (
                  <button
                    key={it.id}
                    onClick={() => scrollToSection(it.id)}
                    className={[
                      'w-3 h-3 border-2 transition-all duration-300 rounded-full',
                      accentPresets[it.a].ring,
                      activeSection === it.id ? `${accentPresets[it.a].dotBg} scale-150` : `${accentPresets[it.a].dotBgHover50}`,
                    ].join(' ')}
                    title={it.label}
                    aria-label={it.label}
                  />
                ))}
              </div>
            </div>
          )}

          {/* NAVBAR – jen interní sekce */}
          <nav
            className={[
              embedded ? 'sticky top-0' : 'fixed top-0 w-full',
              'bg-gray-900/90 backdrop-blur-sm border-b-2 border-green-400 z-50',
              embedded ? 'w-full' : '',
            ].join(' ')}
          >
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center h-16">
                <div className="text-2xl font-jersey font-bold tracking-wider text-green-400">&lt;BITS&BYTES/&gt;</div>

                {/* Desktop menu (scroll-to-section) */}
                <div className="hidden md:flex items-center gap-1">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      className={[
                        'relative group px-4 py-2 text-sm font-bold tracking-wider font-mono transition-colors duration-300',
                        'text-green-400 hover:text-white',
                        'before:absolute before:inset-0 before:bg-green-400/10',
                        'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
                        'before:border-l-4 before:border-green-400',
                        activeSection === item.id ? 'text-white' : '',
                      ].join(' ')}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Mobile menu button */}
                <motion.button
                  type="button"
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  onClick={() => setIsMenuOpen((v) => !v)}
                  whileTap={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                  className="md:hidden p-2 text-green-400"
                >
                  <div className="relative h-6 w-6">
                    <AnimatePresence mode="sync" initial={false}>
                      {!isMenuOpen && (
                        <motion.div
                          key="menu"
                          className="absolute inset-0"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                            <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </motion.div>
                      )}
                      {isMenuOpen && (
                        <motion.div
                          key="close"
                          className="absolute inset-0"
                          initial={{ rotate: -90, opacity: 0 }}
                          animate={{ rotate: 0, opacity: 1 }}
                          exit={{ rotate: 90, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                        >
                          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </div>

              {/* Mobile dropdown (scroll-to-section) */}
              {isMenuOpen && (
                <div className="md:hidden absolute left-0 w-full bg-gray-900 border-b-2 border-green-400" style={{ top: embedded ? undefined : 64 }}>
                  <div className="flex flex-col p-4">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToSection(item.id)}
                        className={[
                          'text-left px-4 py-2 font-mono font-bold transition-colors',
                          'text-green-400 hover:text-white hover:bg-green-400/10 border-l-4',
                          activeSection === item.id ? 'text-white border-green-400' : 'border-transparent',
                        ].join(' ')}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* HERO */}
          <section id="hero" className={['pt-32 md:pt-64 flex items-center relative overflow-hidden', sectionMin, sectionPad].join(' ')}>
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center">
                <div className="mb-8">
                  <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-green-400 mb-3 leading-none font-jersey">
                    <span className="relative inline-block align-top" ref={h1BoxRef}>
                      <span ref={ghostRef} className="invisible whitespace-normal select-none" aria-hidden="true">
                        {fullHeadline}
                      </span>
                      {!typingStarted && (caretStartLeft != null
                        ? <span className="bb-caret-abs" style={{ left: `${caretStartLeft}px` }} aria-hidden="true" />
                        : <span className="bb-caret-center" aria-hidden="true" />
                      )}
                      {typingStarted && (
                        <span className="absolute left-0 top-0 whitespace-pre-wrap">
                          <span>{typedHeadline}</span>
                          {!typingDone && <span className="bb-caret" aria-hidden="true" />}
                        </span>
                      )}
                    </span>
                  </h1>

                  <h2 className={['text-2xl md:text-3xl font-bold text-pink-400 mb-6 transition-opacity duration-500', typingDone ? 'opacity-100' : 'opacity-0', 'font-jersey'].join(' ')}>
                    {t('ServicesSection.hero.sub')}
                  </h2>
                </div>

                <button
                  onClick={() => scrollToSection('web')}
                  className={[
                    'group px-8 py-4 bg-gradient-to-r',
                    accentPresets.green.gradFrom,
                    accentPresets.green.gradTo,
                    'text-gray-900 font-bold tracking-wider border-2',
                    accentPresets.green.ring,
                    'transform hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg',
                    accentPresets.green.hoverShadow,
                  ].join(' ')}
                >
                  {t('ServicesSection.menu.web')}
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&gt;&gt;</span>
                </button>
              </div>
            </div>
          </section>

          {/* WEB */}
          <section id="web" className={[sectionMin, sectionPad, 'flex items-center'].join(' ')}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <Code className={['w-16 h-16 mx-auto mb-4', accentPresets.green.text].join(' ')} />
                <h2 className={['text-4xl font-bold mb-4 tracking-wider', accentPresets.green.text, 'font-jersey'].join(' ')}>{t('ServicesSection.web.title')}</h2>
                <p className="text-gray-300 max-w-3xl mx-auto">{t('ServicesSection.web.lead')}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <ServiceCard
                  icon={Code}
                  title={t('ServicesSection.web.title')}
                  description={t('ServicesSection.web.lead')}
                  features={[
                    t('ServicesSection.web.bullets.i1'),
                    t('ServicesSection.web.bullets.i2'),
                    t('ServicesSection.web.bullets.i3'),
                    t('ServicesSection.web.bullets.i4'),
                  ]}
                  items={showcaseItems}
                  accent="green"
                  learnMoreLabel={t('ServicesSection.web.cta')}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {showcaseItems.map((it, i) => (
                    <RetroBrowserCard
                      key={i}
                      item={it}
                      accent="green"
                      onOpen={(e) => {
                        if (!embedded || !onOpenWeb || !it.href) return;
                        e?.preventDefault?.();
                        e?.stopPropagation?.();
                        onOpenWeb(it.href, it.title);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SEO */}
          <section id="seo" className={[sectionMin, sectionPad, 'flex items-center'].join(' ')}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <Search className={['w-16 h-16 mx-auto mb-4', accentPresets.pink.text].join(' ')} />
                <h2 className={['text-4xl font-bold mb-4 tracking-wider', accentPresets.pink.text, 'font-jersey'].join(' ')}>{t('ServicesSection.seo.title')}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                  <p className="text-gray-300">{t('ServicesSection.seo.lead')}</p>
                  <div className="grid grid-cols-2 gap-3">
                    {['i1', 'i2', 'i3', 'i4'].map(k => (
                      <div key={k} className={['bg-gray-900 border-2 p-4', accentPresets.pink.border].join(' ')}>
                        <div className="text-sm text-white/90">{t(`ServicesSection.seo.bullets.${k}`)}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <ServiceCard
                  icon={TrendingUp}
                  title={t('ServicesSection.seo.title')}
                  description={t('ServicesSection.seo.lead')}
                  features={[
                    t('ServicesSection.seo.bullets.i1'),
                    t('ServicesSection.seo.bullets.i2'),
                    t('ServicesSection.seo.bullets.i3'),
                    t('ServicesSection.seo.bullets.i4'),
                  ]}
                  accent="pink"
                  learnMoreLabel={t('ServicesSection.seo.cta')}
                />
              </div>
            </div>
          </section>

          {/* BRANDING */}
          <section id="branding" className={[sectionMin, sectionPad, 'flex items-center'].join(' ')}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <Palette className={['w-16 h-16 mx-auto mb-4', accentPresets.blue.text].join(' ')} />
                <h2 className={['text-4xl font-bold mb-4 tracking-wider', accentPresets.blue.text, 'font-jersey'].join(' ')}>{t('ServicesSection.branding.title')}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <ServiceCard
                  icon={Palette}
                  title={t('ServicesSection.branding.title')}
                  description={t('ServicesSection.branding.lead')}
                  features={[
                    t('ServicesSection.branding.bullets.i1'),
                    t('ServicesSection.branding.bullets.i2'),
                    t('ServicesSection.branding.bullets.i3'),
                    t('ServicesSection.branding.bullets.i4'),
                  ]}
                  accent="blue"
                  learnMoreLabel={t('ServicesSection.branding.cta')}
                />

                <div className="grid grid-cols-2 gap-4">
                  {['Logo', 'Colors', 'Type', 'UI Kit'].map((lbl, i) => (
                    <div key={i} className={['bg-gray-900 border-2 p-4 hover:shadow-lg transition-all duration-300', accentPresets.blue.border, accentPresets.blue.hoverShadow].join(' ')}>
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-bold">{lbl}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* PRINT */}
          <section id="print" className={[sectionMin, sectionPad, 'flex items-center'].join(' ')}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <Printer className={['w-16 h-16 mx-auto mb-4', accentPresets.purple.text].join(' ')} />
                <h2 className={['text-4xl font-bold mb-4 tracking-wider', accentPresets.purple.text, 'font-jersey'].join(' ')}>{t('ServicesSection.print.title')}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="grid grid-cols-1 gap-4">
                  {['i1', 'i2', 'i3', 'i4'].map(k => (
                    <div key={k} className={['bg-gray-900 border-2 p-4 transition-colors duration-300', accentPresets.purple.border, accentPresets.purple.hoverBg].join(' ')}>
                      <div className="flex justify-between items-center">
                        <h4 className="text-white font-bold">{t(`ServicesSection.print.bullets.${k}`)}</h4>
                      </div>
                    </div>
                  ))}
                </div>

                <ServiceCard
                  icon={Printer}
                  title={t('ServicesSection.print.title')}
                  description={t('ServicesSection.print.lead')}
                  features={[
                    t('ServicesSection.print.bullets.i1'),
                    t('ServicesSection.print.bullets.i2'),
                    t('ServicesSection.print.bullets.i3'),
                    t('ServicesSection.print.bullets.i4'),
                  ]}
                  accent="purple"
                  learnMoreLabel={t('ServicesSection.print.cta')}
                />
              </div>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="py-16 bg-gray-900 border-t-2 border-green-400">
            <div className="container mx-auto px-4 text-center">
              <h3 className="text-3xl font-bold text-white mb-4 tracking-wider font-jersey">{t('contact.title')}</h3>
              <p className="text-gray-300 mb-8 max-w-2xl mx-auto">{t('contact.info')}</p>
              <button
                type="button"
                onClick={() => {
                  if (embedded && onOpenApp) {
                    onOpenApp('contact');
                  } else {
                    scrollToSection('print');
                  }
                }}
                className={[
                  'group inline-block px-8 py-4 bg-gradient-to-r',
                  accentPresets.green.gradFrom,
                  accentPresets.green.gradTo,
                  'text-gray-900 font-bold tracking-wider border-2',
                  accentPresets.green.ring,
                  'transform hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg',
                  accentPresets.green.hoverShadow,
                ].join(' ')}
              >
                {t('nav.contact')}
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">&gt;&gt;</span>
              </button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ServicesSection;
