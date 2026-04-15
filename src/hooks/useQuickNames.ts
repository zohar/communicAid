import { useState, useEffect, useCallback } from 'react';
import { QuickName } from '../types';
import { useTranslation } from './useTranslation';

const STORAGE_KEY = 'communicaid-quick-names';

const defaultQuickNameIds = [
  { id: '1', entryId: 'quickname-nurse', icon: '👩‍⚕️', position: 1 },
  { id: '2', entryId: 'quickname-mum', icon: '👩', position: 2 },
  { id: '3', entryId: 'quickname-dad', icon: '👨', position: 3 },
  { id: '4', entryId: 'quickname-doctor', icon: '👨‍⚕️', position: 4 },
  { id: '5', entryId: 'quickname-partner', icon: '❤️', position: 5 },
  { id: '6', entryId: 'quickname-friend', icon: '🧑', position: 6 },
];

type StoredQuickName = { id: string; name: string; icon: string; position: number };

function loadStored(): StoredQuickName[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useQuickNames() {
  const { t } = useTranslation();
  const [stored, setStored] = useState<StoredQuickName[] | null>(loadStored);

  useEffect(() => {
    const handler = () => setStored(loadStored());
    window.addEventListener('communicaid-quick-names-changed', handler);
    return () => window.removeEventListener('communicaid-quick-names-changed', handler);
  }, []);

  const quickNames: QuickName[] = stored
    ? stored
    : defaultQuickNameIds.map(({ id, entryId, icon, position }) => ({
        id,
        name: t(entryId),
        icon,
        position,
      }));

  const save = useCallback((next: QuickName[]) => {
    const payload: StoredQuickName[] = next.map((q) => ({
      id: q.id,
      name: q.name,
      icon: q.icon,
      position: q.position,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setStored(payload);
    window.dispatchEvent(new Event('communicaid-quick-names-changed'));
  }, []);

  const update = useCallback(
    (id: string, patch: { name?: string; icon?: string }) => {
      const next = quickNames.map((q) => (q.id === id ? { ...q, ...patch } : q));
      save(next);
    },
    [quickNames, save]
  );

  const move = useCallback(
    (id: string, direction: 'up' | 'down') => {
      const index = quickNames.findIndex((q) => q.id === id);
      if (index === -1) return;
      const swapWith = direction === 'up' ? index - 1 : index + 1;
      if (swapWith < 0 || swapWith >= quickNames.length) return;
      const next = [...quickNames];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      const repositioned = next.map((q, i) => ({ ...q, position: i + 1 }));
      save(repositioned);
    },
    [quickNames, save]
  );

  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setStored(null);
    window.dispatchEvent(new Event('communicaid-quick-names-changed'));
  }, []);

  return { quickNames, update, move, reset };
}
