import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportConfig,
  parseAndValidate,
  applyConfig,
} from '../../src/utils/configIO';

const OVERRIDES_KEY = 'communicaid-overrides';
const QUICK_NAMES_KEY = 'communicaid-quick-names';
const LANGUAGE_KEY = 'communicaid-language';

describe('configIO', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('exportConfig', () => {
    it('serializes three localStorage keys to pretty JSON', () => {
      localStorage.setItem(
        OVERRIDES_KEY,
        JSON.stringify({
          'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' },
        })
      );
      localStorage.setItem(
        QUICK_NAMES_KEY,
        JSON.stringify([{ id: '1', name: 'Mom', icon: '👩', position: 1 }])
      );
      localStorage.setItem(LANGUAGE_KEY, 'he');

      const text = exportConfig();
      const parsed = JSON.parse(text);

      expect(parsed.overrides).toEqual({
        'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' },
      });
      expect(parsed.quickNames).toEqual([
        { id: '1', name: 'Mom', icon: '👩', position: 1 },
      ]);
      expect(parsed.language).toBe('he');
      // pretty-printed with 2-space indent
      expect(text).toContain('\n  ');
    });

    it('produces an empty-but-valid file when no customizations exist', () => {
      const text = exportConfig();
      const parsed = JSON.parse(text);
      expect(parsed.overrides).toEqual({});
      expect(parsed.quickNames).toEqual([]);
      expect(typeof parsed.language).toBe('string');
    });
  });

  describe('parseAndValidate', () => {
    it('accepts a round-trip of exportConfig output', () => {
      localStorage.setItem(
        OVERRIDES_KEY,
        JSON.stringify({
          'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' },
        })
      );
      localStorage.setItem(LANGUAGE_KEY, 'en');
      const result = parseAndValidate(exportConfig());
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.config.overrides?.['foo:en']?.text).toBe('Bar');
      }
    });

    it('rejects non-JSON input', () => {
      const result = parseAndValidate('{ this is not json');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('invalid_json');
    });

    it('rejects an array at the top level', () => {
      const result = parseAndValidate('["wrong"]');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('invalid_shape');
    });

    it('rejects an unknown language code', () => {
      const result = parseAndValidate(JSON.stringify({ language: 'fr' }));
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('invalid_language');
    });

    it('rejects an oversized text override', () => {
      const big = 'x'.repeat(101);
      const result = parseAndValidate(
        JSON.stringify({
          overrides: {
            'foo:en': { entryId: 'foo', language: 'en', text: big },
          },
        })
      );
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.kind).toBe('oversized_field');
    });

    it('accepts a file with missing top-level keys', () => {
      const result = parseAndValidate(JSON.stringify({ language: 'en' }));
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.config.overrides).toBeUndefined();
        expect(result.config.quickNames).toBeUndefined();
        expect(result.config.language).toBe('en');
      }
    });

    it('ignores unknown top-level keys (forward-compat)', () => {
      const result = parseAndValidate(
        JSON.stringify({ language: 'en', futureFeature: { whatever: true } })
      );
      expect(result.ok).toBe(true);
    });
  });

  describe('applyConfig', () => {
    it('writes all three localStorage keys', () => {
      applyConfig({
        overrides: {
          'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' },
        },
        quickNames: [{ id: '1', name: 'Mom', icon: '👩', position: 1 }],
        language: 'he',
      });
      expect(JSON.parse(localStorage.getItem(OVERRIDES_KEY)!)).toEqual({
        'foo:en': { entryId: 'foo', language: 'en', text: 'Bar' },
      });
      expect(JSON.parse(localStorage.getItem(QUICK_NAMES_KEY)!)).toEqual([
        { id: '1', name: 'Mom', icon: '👩', position: 1 },
      ]);
      expect(localStorage.getItem(LANGUAGE_KEY)).toBe('he');
    });

    it('clears keys for sections missing in the input (full replace)', () => {
      localStorage.setItem(
        OVERRIDES_KEY,
        JSON.stringify({
          'old:en': { entryId: 'old', language: 'en', text: 'gone' },
        })
      );
      localStorage.setItem(
        QUICK_NAMES_KEY,
        JSON.stringify([{ id: '1', name: 'X', icon: 'X', position: 1 }])
      );
      applyConfig({ language: 'en' });
      expect(localStorage.getItem(OVERRIDES_KEY)).toBeNull();
      expect(localStorage.getItem(QUICK_NAMES_KEY)).toBeNull();
      expect(localStorage.getItem(LANGUAGE_KEY)).toBe('en');
    });

    it('dispatches the three change events', () => {
      const events: string[] = [];
      const handler = (e: Event) => events.push(e.type);
      window.addEventListener('communicaid-overrides-changed', handler);
      window.addEventListener('communicaid-quick-names-changed', handler);
      window.addEventListener('communicaid-language-changed', handler);
      try {
        applyConfig({ overrides: {}, quickNames: [], language: 'en' });
      } finally {
        window.removeEventListener('communicaid-overrides-changed', handler);
        window.removeEventListener('communicaid-quick-names-changed', handler);
        window.removeEventListener('communicaid-language-changed', handler);
      }
      expect(events).toContain('communicaid-overrides-changed');
      expect(events).toContain('communicaid-quick-names-changed');
      expect(events).toContain('communicaid-language-changed');
    });

    it('rolls back on partial-write failure (snapshot restore)', () => {
      // Seed pre-existing state we expect to be restored
      localStorage.setItem(OVERRIDES_KEY, JSON.stringify({ seeded: 'overrides' }));
      localStorage.setItem(QUICK_NAMES_KEY, JSON.stringify(['seeded']));
      localStorage.setItem(LANGUAGE_KEY, 'ar');

      // Make the second setItem call throw
      const original = Storage.prototype.setItem;
      let calls = 0;
      Storage.prototype.setItem = function (key: string, value: string) {
        calls += 1;
        if (calls === 2) throw new Error('QuotaExceededError');
        return original.call(this, key, value);
      };

      try {
        expect(() =>
          applyConfig({
            overrides: { 'new:en': { entryId: 'new', language: 'en', text: 'X' } },
            quickNames: [{ id: '1', name: 'Z', icon: 'Z', position: 1 }],
            language: 'he',
          })
        ).toThrow();
      } finally {
        Storage.prototype.setItem = original;
      }

      // All three keys must be byte-identical to their pre-call values
      expect(JSON.parse(localStorage.getItem(OVERRIDES_KEY)!)).toEqual({
        seeded: 'overrides',
      });
      expect(JSON.parse(localStorage.getItem(QUICK_NAMES_KEY)!)).toEqual(['seeded']);
      expect(localStorage.getItem(LANGUAGE_KEY)).toBe('ar');
    });
  });
});
