import { Language, LanguageConfig, TranslationDictionary } from '../../types';
import { en } from './en';
import { he } from './he';
import { ar } from './ar';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  he,
  ar,
};

export const languageConfigs: Record<Language, LanguageConfig> = {
  en: { code: 'en', name: 'English', dir: 'ltr', isRTL: false },
  he: { code: 'he', name: 'עברית', dir: 'rtl', isRTL: true },
  ar: { code: 'ar', name: 'العربية', dir: 'rtl', isRTL: true },
};

export const defaultLanguage: Language = 'en';
export const supportedLanguages: Language[] = ['en', 'he', 'ar'];
