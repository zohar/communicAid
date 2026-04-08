import { useMemo, useSyncExternalStore } from 'react';
import { useLanguage } from './useLanguage';
import { CustomOverride } from '../types';
import { translations } from '../data/translations';

const OVERRIDES_KEY = 'communicaid-overrides';

function getOverridesSnapshot(): Record<string, CustomOverride> {
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

let cachedOverrides: Record<string, CustomOverride> = getOverridesSnapshot();
let cachedRaw: string | null = localStorage.getItem(OVERRIDES_KEY);

function subscribe(callback: () => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key === OVERRIDES_KEY) callback();
  };
  window.addEventListener('storage', handler);

  const customHandler = () => callback();
  window.addEventListener('communicaid-overrides-changed', customHandler);

  return () => {
    window.removeEventListener('storage', handler);
    window.removeEventListener('communicaid-overrides-changed', customHandler);
  };
}

function getSnapshot(): Record<string, CustomOverride> {
  const raw = localStorage.getItem(OVERRIDES_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedOverrides = getOverridesSnapshot();
  }
  return cachedOverrides;
}

export function useTranslation() {
  const { language } = useLanguage();
  const overrides = useSyncExternalStore(subscribe, getSnapshot);

  const t = useMemo(() => (entryId: string): string => {
    const overrideKey = `${entryId}:${language}`;
    const override = overrides[overrideKey];
    if (override?.text) return override.text;
    return translations[language]?.[entryId] ?? translations.en[entryId] ?? entryId;
  }, [language, overrides]);

  const tEn = useMemo(() => (entryId: string): string | null => {
    if (language === 'en') return null;
    return translations.en[entryId] ?? null;
  }, [language]);

  const iconOverride = useMemo(() => (entryId: string): string | null => {
    const overrideKey = `${entryId}:${language}`;
    const override = overrides[overrideKey];
    return override?.icon ?? null;
  }, [language, overrides]);

  return { t, tEn, iconOverride };
}
