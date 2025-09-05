// src/hooks/useTranslation.ts
import { useState, useCallback } from 'react';
import { translations } from '../data/translations';
import { Language, Translation } from '../types';

const LS_KEY = 'lang';

const getInitialLang = (): Language => {
  const fromLS = (typeof window !== 'undefined' && localStorage.getItem(LS_KEY)) as Language | null;
  if (fromLS === 'cs' || fromLS === 'en') return fromLS;
  // jednoduchý odhad z prohlížeče
  return navigator.language?.toLowerCase().startsWith('cs') ? 'cs' as Language : 'en';
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(getInitialLang);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let value: Translation | string = translations[language];
    for (const k of keys) {
      if (typeof value === 'object' && value && k in value) {
        value = (value as Record<string, Translation | string>)[k];
      } else {
        return key; // fallback: vrať klíč, když není překlad
      }
    }
    return typeof value === 'string' ? value : key;
  }, [language]);

  // ⬅️ Přepnutí konkrétního jazyka, nebo toggle, + uložení do localStorage
  const switchLanguage = useCallback((l?: Language) => {
    setLanguage(prev => {
      const next = l ?? (prev === 'en' ? 'cs' : 'en');
      try { localStorage.setItem(LS_KEY, next); } catch {}
      return next;
    });
  }, []);

  return { t, language, switchLanguage };
};
