import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { SupportedLanguage, TranslationSchema } from './types';
import { es } from './locales/es';
import { en } from './locales/en';
import { pt } from './locales/pt';

const DICTIONARIES: Record<SupportedLanguage, TranslationSchema> = {
  es,
  en,
  pt,
};

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextProps>({
  language: 'es',
  setLanguage: () => {},
  t: (path: string) => path,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('governance_hub_lang');
    if (saved && (saved === 'es' || saved === 'en' || saved === 'pt')) {
      return saved as SupportedLanguage;
    }

    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('es')) return 'es';
    return 'en';
  });

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem('governance_hub_lang', lang);
    document.documentElement.lang = lang;
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const keys = path.split('.');
      let current: any = DICTIONARIES[language] || DICTIONARIES.es;

      for (const key of keys) {
        if (current && typeof current === 'object' && key in current) {
          current = current[key];
        } else {
          // Fallback a español si la clave no se encuentra
          let fallback: any = DICTIONARIES.es;
          for (const fbKey of keys) {
            if (fallback && typeof fallback === 'object' && fbKey in fallback) {
              fallback = fallback[fbKey];
            } else {
              return path;
            }
          }
          current = fallback;
          break;
        }
      }

      if (typeof current !== 'string') {
        return path;
      }

      if (params) {
        return Object.entries(params).reduce((str, [paramKey, val]) => {
          return str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(val));
        }, current);
      }

      return current;
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
};

