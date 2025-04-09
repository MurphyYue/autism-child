
import { Locale, defaultLocale, locales } from '@/i18n/config';

export const getUserLocale = (): Locale => {
  if (typeof window === 'undefined') return defaultLocale;
  
  const savedLocale = localStorage.getItem('userLocale');
  if (savedLocale && locales.includes(savedLocale as Locale)) {
    return savedLocale as Locale;
  }
  
  return defaultLocale;
};

export const setUserLocale = (locale: Locale) => {
  localStorage.setItem('userLocale', locale);
};