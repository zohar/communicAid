import type { CustomOverride, Language } from '../types';

const OVERRIDES_KEY = 'communicaid-overrides';
const QUICK_NAMES_KEY = 'communicaid-quick-names';
const LANGUAGE_KEY = 'communicaid-language';

const VALID_LANGUAGES: readonly Language[] = ['en', 'he', 'ar', 'ru'] as const;
const MAX_FIELD_LENGTH = 100;

type StoredQuickName = {
  id: string;
  name: string;
  icon: string;
  position: number;
};

export interface ExportedConfig {
  overrides?: Record<string, CustomOverride>;
  quickNames?: StoredQuickName[];
  language?: Language;
}

export type ImportError =
  | { kind: 'invalid_json'; message: string }
  | { kind: 'invalid_shape'; message: string }
  | { kind: 'invalid_language'; message: string }
  | { kind: 'oversized_field'; message: string }
  | { kind: 'storage_error'; message: string };

export type ImportResult =
  | { ok: true; config: ExportedConfig }
  | { ok: false; error: ImportError };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isValidLanguage(value: unknown): value is Language {
  return (
    typeof value === 'string' &&
    (VALID_LANGUAGES as readonly string[]).includes(value)
  );
}

function readOverrides(): Record<string, CustomOverride> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return isPlainObject(parsed) ? (parsed as Record<string, CustomOverride>) : {};
  } catch {
    return {};
  }
}

function readQuickNames(): StoredQuickName[] {
  try {
    const raw = localStorage.getItem(QUICK_NAMES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredQuickName[]) : [];
  } catch {
    return [];
  }
}

function readLanguage(): Language {
  const raw = localStorage.getItem(LANGUAGE_KEY);
  return isValidLanguage(raw) ? raw : 'en';
}

export function exportConfig(): string {
  const config: ExportedConfig = {
    overrides: readOverrides(),
    quickNames: readQuickNames(),
    language: readLanguage(),
  };
  return JSON.stringify(config, null, 2);
}

function validateOverride(
  value: unknown
): { ok: true; value: CustomOverride } | { ok: false; error: ImportError } {
  if (!isPlainObject(value)) {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'override entry is not an object' },
    };
  }
  if (typeof value.entryId !== 'string' || value.entryId.length === 0) {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'override is missing a valid entryId' },
    };
  }
  if (!isValidLanguage(value.language)) {
    return {
      ok: false,
      error: {
        kind: 'invalid_language',
        message: `override has unknown language: ${String(value.language)}`,
      },
    };
  }
  const result: CustomOverride = { entryId: value.entryId, language: value.language };
  if (value.text !== undefined) {
    if (typeof value.text !== 'string') {
      return {
        ok: false,
        error: { kind: 'invalid_shape', message: 'override.text must be a string' },
      };
    }
    if (value.text.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        error: {
          kind: 'oversized_field',
          message: `override.text exceeds ${MAX_FIELD_LENGTH} characters`,
        },
      };
    }
    result.text = value.text;
  }
  if (value.icon !== undefined) {
    if (typeof value.icon !== 'string') {
      return {
        ok: false,
        error: { kind: 'invalid_shape', message: 'override.icon must be a string' },
      };
    }
    if (value.icon.length > MAX_FIELD_LENGTH) {
      return {
        ok: false,
        error: {
          kind: 'oversized_field',
          message: `override.icon exceeds ${MAX_FIELD_LENGTH} characters`,
        },
      };
    }
    result.icon = value.icon;
  }
  return { ok: true, value: result };
}

function validateQuickName(
  value: unknown
): { ok: true; value: StoredQuickName } | { ok: false; error: ImportError } {
  if (!isPlainObject(value)) {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'quickName entry is not an object' },
    };
  }
  if (typeof value.id !== 'string') {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'quickName.id must be a string' },
    };
  }
  if (typeof value.name !== 'string') {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'quickName.name must be a string' },
    };
  }
  if (value.name.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: {
        kind: 'oversized_field',
        message: `quickName.name exceeds ${MAX_FIELD_LENGTH} characters`,
      },
    };
  }
  if (typeof value.icon !== 'string') {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'quickName.icon must be a string' },
    };
  }
  if (value.icon.length > MAX_FIELD_LENGTH) {
    return {
      ok: false,
      error: {
        kind: 'oversized_field',
        message: `quickName.icon exceeds ${MAX_FIELD_LENGTH} characters`,
      },
    };
  }
  if (typeof value.position !== 'number') {
    return {
      ok: false,
      error: { kind: 'invalid_shape', message: 'quickName.position must be a number' },
    };
  }
  return {
    ok: true,
    value: {
      id: value.id,
      name: value.name,
      icon: value.icon,
      position: value.position,
    },
  };
}

export function parseAndValidate(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return {
      ok: false,
      error: { kind: 'invalid_json', message: (err as Error).message },
    };
  }

  if (!isPlainObject(parsed)) {
    return {
      ok: false,
      error: {
        kind: 'invalid_shape',
        message: 'Top-level value must be a JSON object',
      },
    };
  }

  const config: ExportedConfig = {};

  if (parsed.language !== undefined) {
    if (!isValidLanguage(parsed.language)) {
      return {
        ok: false,
        error: {
          kind: 'invalid_language',
          message: `Unknown language code: ${String(parsed.language)}`,
        },
      };
    }
    config.language = parsed.language;
  }

  if (parsed.overrides !== undefined) {
    if (!isPlainObject(parsed.overrides)) {
      return {
        ok: false,
        error: { kind: 'invalid_shape', message: 'overrides must be an object' },
      };
    }
    const validated: Record<string, CustomOverride> = {};
    for (const [key, value] of Object.entries(parsed.overrides)) {
      const result = validateOverride(value);
      if (!result.ok) return { ok: false, error: result.error };
      validated[key] = result.value;
    }
    config.overrides = validated;
  }

  if (parsed.quickNames !== undefined) {
    if (!Array.isArray(parsed.quickNames)) {
      return {
        ok: false,
        error: { kind: 'invalid_shape', message: 'quickNames must be an array' },
      };
    }
    const validated: StoredQuickName[] = [];
    for (const value of parsed.quickNames) {
      const result = validateQuickName(value);
      if (!result.ok) return { ok: false, error: result.error };
      validated.push(result.value);
    }
    config.quickNames = validated;
  }

  return { ok: true, config };
}

export function applyConfig(config: ExportedConfig): void {
  // Snapshot the three keys before any write so we can roll back on failure.
  const snapshot = {
    overrides: localStorage.getItem(OVERRIDES_KEY),
    quickNames: localStorage.getItem(QUICK_NAMES_KEY),
    language: localStorage.getItem(LANGUAGE_KEY),
  };

  const restoreSnapshot = () => {
    if (snapshot.overrides === null) {
      localStorage.removeItem(OVERRIDES_KEY);
    } else {
      localStorage.setItem(OVERRIDES_KEY, snapshot.overrides);
    }
    if (snapshot.quickNames === null) {
      localStorage.removeItem(QUICK_NAMES_KEY);
    } else {
      localStorage.setItem(QUICK_NAMES_KEY, snapshot.quickNames);
    }
    if (snapshot.language === null) {
      localStorage.removeItem(LANGUAGE_KEY);
    } else {
      localStorage.setItem(LANGUAGE_KEY, snapshot.language);
    }
  };

  try {
    if (config.overrides !== undefined) {
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify(config.overrides));
    } else {
      localStorage.removeItem(OVERRIDES_KEY);
    }
    if (config.quickNames !== undefined) {
      localStorage.setItem(QUICK_NAMES_KEY, JSON.stringify(config.quickNames));
    } else {
      localStorage.removeItem(QUICK_NAMES_KEY);
    }
    if (config.language !== undefined) {
      localStorage.setItem(LANGUAGE_KEY, config.language);
    } else {
      localStorage.removeItem(LANGUAGE_KEY);
    }
  } catch (err) {
    try {
      restoreSnapshot();
    } catch {
      // If even the rollback fails, surface the original error anyway.
    }
    const error: ImportError = {
      kind: 'storage_error',
      message: (err as Error).message || 'Failed to write configuration to storage',
    };
    throw Object.assign(new Error(error.message), { importError: error });
  }

  // Dispatch change events only after all writes succeeded.
  window.dispatchEvent(new Event('communicaid-overrides-changed'));
  window.dispatchEvent(new Event('communicaid-quick-names-changed'));
  window.dispatchEvent(new Event('communicaid-language-changed'));
}
