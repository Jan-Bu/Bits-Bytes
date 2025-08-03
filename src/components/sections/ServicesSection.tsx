import React from 'react';
import { Code, Palette, Monitor } from 'lucide-react';

interface ServicesSectionProps {
  t: (key: string) => string;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ t }) => {
  const services = [
    {
      icon: Code,
      title: t('services.web.title'),
      description: t('services.web.description'),
      color: '#fffc00'
    },
    {
      icon: Palette,
      title: t('services.branding.title'),
      description: t('services.branding.description'),
      color: '#85fbff'
    },
    {
      icon: Monitor,
      title: t('services.design.title'),
      description: t('services.design.description'),
      color: '#bbfffc'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="font-jersey text-4xl md:text-6xl text-[#fffc00] mb-12 text-center">
        {t('services.title')}
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <div
              key={index}
              className="bg-black/50 border border-[#85fbff] rounded-lg p-6 hover:border-[#fffc00] transition-all duration-300 hover:shadow-lg hover:shadow-[#85fbff]/20"
            >
              <Icon 
                size={48} 
                className="mb-4 mx-auto"
                style={{ color: service.color }}
              />
              <h3 className="font-jersey text-2xl text-white mb-4 text-center">
                {service.title}
              </h3>
              <p className="font-ubuntu text-white/80 text-center">
                {service.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServicesSection;
