import { useState, useCallback } from 'react';
import { translations } from '../data/translations';
import { Language, Translation } from '../types';

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>('en');

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: Translation | string = translations[language];
    
    for (const k of keys) {
      if (typeof value === 'object' && value[k]) {
        value = value[k];
      } else {
        return key; // Return key if translation not found
      }
    }
    
    return typeof value === 'string' ? value : key;
  }, [language]);

  const switchLanguage = useCallback(() => {
    setLanguage(prev => prev === 'en' ? 'cs' : 'en');
  }, []);

  return { t, language, switchLanguage };
};