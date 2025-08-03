import React from 'react';

interface TermsSectionProps {
  t: (key: string) => string;
}

const TermsSection: React.FC<TermsSectionProps> = ({ t }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="font-jersey text-4xl md:text-6xl text-[#fffc00] mb-8 text-center">
        {t('terms.title')}
      </h2>
      <div className="bg-black/50 border border-[#85fbff] rounded-lg p-8">
        <p className="font-ubuntu text-white leading-relaxed">
          {t('terms.content')}
        </p>
      </div>
    </div>
  );
};

export default TermsSection;
