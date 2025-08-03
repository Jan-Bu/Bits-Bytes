export type Language = 'en' | 'cs';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  en: Translation;
  cs: Translation;
}

export type MenuSection = 'home' | 'about' | 'services' | 'pricing' | 'blog' | 'contact' | 'terms' | 'gdpr';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}