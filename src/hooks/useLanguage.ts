import { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { languageConfigs, defaultLanguage } from '../data/translations';

const STORAGE_KEY = 'communicaid-language';

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'he' || stored === 'ar' || stored === 'ru') return stored;
  return defaultLanguage;
}

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }, []);

  useEffect(() => {
    const config = languageConfigs[language];
    document.documentElement.dir = config.dir;
    document.documentElement.lang = language;
  }, [language]);

  const config = languageConfigs[language];

  return {
    language,
    setLanguage,
    isRTL: config.isRTL,
    dir: config.dir,
  };
}
