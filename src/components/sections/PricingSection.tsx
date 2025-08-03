import React from 'react';
import { Check } from 'lucide-react';

interface PricingSectionProps {
  t: (key: string) => string;
}

const PricingSection: React.FC<PricingSectionProps> = ({ t }) => {
  const plans = [
    {
      title: t('pricing.starter.title'),
      price: t('pricing.starter.price'),
      features: t('pricing.starter.features').split(','),
      highlight: false
    },
    {
      title: t('pricing.professional.title'),
      price: t('pricing.professional.price'),
      features: t('pricing.professional.features').split(','),
      highlight: true
    },
    {
      title: t('pricing.enterprise.title'),
      price: t('pricing.enterprise.price'),
      features: t('pricing.enterprise.features').split(','),
      highlight: false
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="font-jersey text-4xl md:text-6xl text-[#fffc00] mb-12 text-center">
        {t('pricing.title')}
      </h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`relative bg-black/50 border rounded-lg p-8 ${
              plan.highlight 
                ? 'border-[#fffc00] shadow-lg shadow-[#fffc00]/20' 
                : 'border-[#85fbff]'
            } hover:border-[#fffc00] transition-all duration-300`}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#fffc00] text-black px-4 py-1 rounded-full font-ubuntu font-bold text-sm">
                Popular
              </div>
            )}
            
            <h3 className="font-jersey text-3xl text-white mb-4 text-center">
              {plan.title}
            </h3>
            
            <div className="text-center mb-8">
              <span className="font-jersey text-4xl text-[#fffc00]">
                {plan.price}
              </span>
            </div>
            
            <ul className="space-y-4 mb-8">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex} className="flex items-center gap-3">
                  <Check size={20} className="text-[#85fbff] flex-shrink-0" />
                  <span className="font-ubuntu text-white text-sm">
                    {feature.trim()}
                  </span>
                </li>
              ))}
            </ul>
            
            <button className="w-full bg-[#1e0c53] text-white font-ubuntu font-bold py-3 rounded-lg hover:bg-[#fffc00] hover:text-black transition-all duration-300">
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
