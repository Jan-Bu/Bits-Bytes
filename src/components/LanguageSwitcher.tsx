import React from 'react';
import { Globe } from 'lucide-react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  language: Language;
  onSwitch: () => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  language,
  onSwitch
}) => {
  return (
    <button
      onClick={onSwitch}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-black/80 backdrop-blur-sm border border-[#85fbff] rounded-lg text-white hover:bg-[#1e0c53] transition-all duration-300 hover:shadow-lg hover:shadow-[#85fbff]/20"
    >
      <Globe size={16} />
      <span className="font-ubuntu text-sm font-medium">
        {language.toUpperCase()}
      </span>
    </button>
  );
};