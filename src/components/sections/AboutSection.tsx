import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AboutSectionProps {
  t: (key: string) => string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ t }) => {
  const [scrollY, setScrollY] = useState(0);
  const [visibleSections, setVisibleSections] = useState(new Set<string>());

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setVisibleSections((prev) => new Set([...prev, entry.target.id]));
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="h-screen overflow-y-scroll scroll-smooth bg-gradient-to-b from-[#050B2C] via-[#080F3A] to-[#0B143F]">
      {/* About Us */}
      <section
        id="about-intro"
        data-animate
        className={`min-h-screen flex items-center justify-center text-white transition-all duration-1000 ${visibleSections.has('about-intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1
            className="text-6xl md:text-8xl font-bold text-[#FFED29]"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            {t('about.intro.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed mt-6 whitespace-pre-line">
            {t('about.intro.content')}
          </p>
        </div>
      </section>

      {/* Transition Glass Cards */}
      <section
        id="about-transition"
        data-animate
        className={`relative z-30 py-24 transition-all duration-1000 ${visibleSections.has('about-intro') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto px-0 py-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {['web', 'branding', 'copywriting', 'seo'].map((key) => (
              <div
                key={key}
                className="relative group flex flex-col transition-all duration-500 hover:-translate-y-2"
              >
                <div className="absolute inset-0 rounded-3xl blur-3xl transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#FFED29]/20 group-hover:to-pink-400/20" />
                <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-6 border border-white/10 text-white text-center">
                  <h4
                    className="text-xl font-bold text-[#FFED29] mb-4"
                    style={{ textShadow: '1px 1px 0 #000' }}
                  >
                    {t(`about.services.${key}.title`)}
                  </h4>
                  <p className="text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {t(`about.services.${key}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Can Do */}
      <section
        id="about-skills"
        data-animate
        className={`min-h-screen flex items-center justify-center py-24 text-white transition-all duration-1000 delay-100 ${visibleSections.has('about-skills') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto px-6 text-center">
          <h2
            className="text-5xl md:text-7xl font-bold text-[#FFED29] mb-8"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            {t('about.skills.title')}
          </h2>
          <p className="text-xl text-white max-w-3xl mx-auto leading-relaxed whitespace-pre-line">
            {t('about.skills.content')}
          </p>
        </div>
      </section>

      {/* Our Mission and Vision */}
      <section
        id="about-mission"
        data-animate
        className={`min-h-screen flex flex-col justify-center py-24 text-white transition-all duration-1000 delay-200 ${visibleSections.has('about-mission') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
      >
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Mission */}
            <div className="relative group flex flex-col h-full transition-all duration-500 hover:-translate-y-2">
              <h3
                className="text-3xl font-bold text-[#FFED29] mb-6 text-center"
                style={{ textShadow: '2px 2px 0 #000' }}
              >
                {t('about.mission.title')}
              </h3>
              <div className="absolute inset-0 rounded-3xl blur-3xl transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#FFED29]/20 group-hover:to-pink-400/20" />
              <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 flex-grow">
                <p className="text-lg text-white leading-relaxed whitespace-pre-line">
                  {t('about.mission.content')}
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="relative group flex flex-col h-full transition-all duration-500 hover:-translate-y-2">
              <h3
                className="text-3xl font-bold text-[#FFED29] mb-6 text-center"
                style={{ textShadow: '2px 2px 0 #000' }}
              >
                {t('about.vision.title')}
              </h3>
              <div className="absolute inset-0 rounded-3xl blur-3xl transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#FFED29]/20 group-hover:to-pink-400/20" />
              <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10 flex-grow">
                <p className="text-lg text-white leading-relaxed whitespace-pre-line">
                  {t('about.vision.content')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="relative py-32 px-6 text-center text-white">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-4xl md:text-6xl font-bold text-[#FFED29] mb-10"
            style={{ textShadow: '2px 2px 0 #000' }}
          >
            {t('about.team.title')}
          </h2>
          <p className="text-xl mb-6 whitespace-pre-line">{t('about.team.members')}</p>
          <button
            className="bg-[#FFED29] text-black font-bold px-12 py-5 text-lg md:text-2xl rounded-full hover:bg-yellow-300 hover:text-black transition-all duration-300 shadow-md hover:shadow-yellow-400/50"
            style={{ textShadow: '1px 1px 0 #000' }}
          >
            {t('about.cta.button')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutSection;
