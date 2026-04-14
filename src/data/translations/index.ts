import { Language, LanguageConfig, TranslationDictionary } from '../../types';
import { en } from './en';
import { he } from './he';
import { ar } from './ar';
import { ru } from './ru';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  he,
  ar,
  ru,
};

export const languageConfigs: Record<Language, LanguageConfig> = {
  en: { code: 'en', name: 'English', dir: 'ltr', isRTL: false },
  he: { code: 'he', name: 'עברית', dir: 'rtl', isRTL: true },
  ar: { code: 'ar', name: 'العربية', dir: 'rtl', isRTL: true },
  ru: { code: 'ru', name: 'Русский', dir: 'ltr', isRTL: false },
};

export const defaultLanguage: Language = 'en';
export const supportedLanguages: Language[] = ['en', 'he', 'ar', 'ru'];
