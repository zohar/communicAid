import { Language, CustomOverride } from '../types';
import { translations } from '../data/translations';

export function resolveEntry(
  entryId: string,
  language: Language,
  overrides: Record<string, CustomOverride>
): { text: string; subtitle: string | null } {
  const overrideKey = `${entryId}:${language}`;
  const override = overrides[overrideKey];

  const text = override?.text ?? translations[language]?.[entryId] ?? translations.en[entryId] ?? entryId;
  const subtitle = language === 'en' ? null : (translations.en[entryId] ?? null);

  return { text, subtitle };
}
