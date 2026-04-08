import { useState, useCallback } from 'react';
import { CustomOverride } from '../types';
import { useLanguage } from './useLanguage';
import { categories } from '../data/categories';

const OVERRIDES_KEY = 'communicaid-overrides';

function getAllOverrides(): Record<string, CustomOverride> {
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveAllOverrides(overrides: Record<string, CustomOverride>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  window.dispatchEvent(new Event('communicaid-overrides-changed'));
}

export function useOverrides(categoryId: string) {
  const { language } = useLanguage();
  const [overrides, setOverrides] = useState<Record<string, CustomOverride>>(getAllOverrides);

  const setOverride = useCallback((entryId: string, patch: { text?: string; icon?: string }) => {
    setOverrides(prev => {
      const key = `${entryId}:${language}`;
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          entryId,
          language,
          ...patch,
        },
      };
      saveAllOverrides(updated);
      return updated;
    });
  }, [language]);

  const resetCategory = useCallback(() => {
    setOverrides(prev => {
      const entryIds = new Set<string>();
      entryIds.add(categoryId);

      function collectIds(cat: typeof categories[0]) {
        cat.items?.forEach(item => entryIds.add(item.id));
        cat.phrases?.forEach(phrase => entryIds.add(phrase.id));
        cat.subcategories?.forEach(sub => {
          entryIds.add(sub.id);
          collectIds(sub);
        });
      }

      const category = categories.find(c => c.id === categoryId);
      if (category) collectIds(category);

      const updated = { ...prev };
      for (const entryId of entryIds) {
        delete updated[`${entryId}:${language}`];
      }
      saveAllOverrides(updated);
      return updated;
    });
  }, [categoryId, language]);

  return { overrides, setOverride, resetCategory };
}
