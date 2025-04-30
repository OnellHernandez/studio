"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type {Locale} from '@/lib/i18n';
import { translations } from '@/lib/i18n';


interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: keyof typeof translations.en) => string; // Translation function
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Locale>('en'); // Default to English

  // Translation function
   const t = useCallback((key: keyof typeof translations.en): string => {
     // Fallback to English if translation is missing for the current language
     return translations[language][key] || translations.en[key] || key;
   }, [language]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
