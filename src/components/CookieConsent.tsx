import React, { useState } from 'react';
import { X } from 'lucide-react';
import { CookiePreferences } from '../types';

interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
  t: (key: string) => string;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onDecline,
  t
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    marketing: true
  });

  const handleAcceptAll = () => {
    onAccept({ necessary: true, analytics: true, marketing: true });
  };

  const handleSavePreferences = () => {
    onAccept(preferences);
  };

  if (showCustomize) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-black border border-[#85fbff] rounded-lg p-6 max-w-md w-full relative">
          <button
            onClick={() => setShowCustomize(false)}
            className="absolute top-4 right-4 text-white hover:text-[#fffc00] transition-colors"
          >
            <X size={20} />
          </button>
          
          <h3 className="font-jersey text-xl text-[#fffc00] mb-4">
            {t('cookies.title')}
          </h3>
          
          <p className="font-ubuntu text-white mb-6 text-sm">
            {t('cookies.description')}
          </p>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-ubuntu text-white text-sm">
                {t('cookies.necessary')}
              </span>
              <input
                type="checkbox"
                checked={preferences.necessary}
                disabled
                className="accent-[#85fbff]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-ubuntu text-white text-sm">
                {t('cookies.analytics')}
              </span>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                className="accent-[#85fbff]"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="font-ubuntu text-white text-sm">
                {t('cookies.marketing')}
              </span>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                className="accent-[#85fbff]"
              />
            </div>
          </div>
          
          <button
            onClick={handleSavePreferences}
            className="w-full bg-[#fffc00] text-black font-ubuntu font-bold py-3 rounded-lg hover:bg-[#85fbff] transition-colors duration-300"
          >
            {t('cookies.save')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-sm border-t border-[#85fbff] p-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-ubuntu text-white text-sm">
          {t('cookies.description')}
        </p>
        
        <div className="flex gap-2">
          <button
            onClick={onDecline}
            className="px-4 py-2 border border-[#85fbff] text-[#85fbff] rounded-lg hover:bg-[#85fbff] hover:text-black transition-all duration-300 font-ubuntu text-sm"
          >
            {t('cookies.decline')}
          </button>
          
          <button
            onClick={() => setShowCustomize(true)}
            className="px-4 py-2 bg-[#1e0c53] text-white rounded-lg hover:bg-[#1e0c53]/80 transition-all duration-300 font-ubuntu text-sm"
          >
            {t('cookies.customize')}
          </button>
          
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 bg-[#fffc00] text-black rounded-lg hover:bg-[#85fbff] transition-all duration-300 font-ubuntu font-bold text-sm"
          >
            {t('cookies.accept')}
          </button>
        </div>
      </div>
    </div>
  );
};