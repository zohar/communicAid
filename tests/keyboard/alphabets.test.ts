import { describe, it, expect } from 'vitest';
import { alphabets, alphabetGridColumns } from '../../src/data/alphabets';
import type { Language } from '../../src/types';

const EXPECTED_LENGTHS: Record<Language, number> = {
  en: 26,
  he: 22,
  ar: 28,
  ru: 33,
};

const ALL_LANGUAGES = Object.keys(EXPECTED_LENGTHS) as Language[];

describe('alphabets', () => {
  it.each(ALL_LANGUAGES)('%s has the expected number of letters', (lang) => {
    expect(alphabets[lang].length).toBe(EXPECTED_LENGTHS[lang]);
  });

  it.each(ALL_LANGUAGES)('%s has no duplicate letters', (lang) => {
    const letters = alphabets[lang];
    const unique = new Set(letters);
    expect(unique.size).toBe(letters.length);
  });

  it.each(ALL_LANGUAGES)(
    '%s contains no whitespace, digits, or punctuation',
    (lang) => {
      for (const letter of alphabets[lang]) {
        expect(letter.length).toBeGreaterThan(0);
        expect(letter).not.toMatch(/\s/);
        expect(letter).not.toMatch(/\d/);
        expect(letter).not.toMatch(/[.,!?;:'"()]/);
      }
    },
  );

  it('english alphabet starts with A and ends with Z', () => {
    expect(alphabets.en[0]).toBe('A');
    expect(alphabets.en[alphabets.en.length - 1]).toBe('Z');
  });

  it('hebrew alphabet starts with alef and ends with tav', () => {
    expect(alphabets.he[0]).toBe('א');
    expect(alphabets.he[alphabets.he.length - 1]).toBe('ת');
  });

  it('arabic alphabet starts with alef and ends with yaa', () => {
    expect(alphabets.ar[0]).toBe('ا');
    expect(alphabets.ar[alphabets.ar.length - 1]).toBe('ي');
  });

  it('arabic alphabet does not contain the lam-alif ligature', () => {
    expect(alphabets.ar).not.toContain('لا');
  });

  it('russian alphabet starts with А and ends with Я', () => {
    expect(alphabets.ru[0]).toBe('А');
    expect(alphabets.ru[alphabets.ru.length - 1]).toBe('Я');
  });

  it('russian alphabet has Ё immediately after Е and before Ж', () => {
    const ru = alphabets.ru;
    const eIndex = ru.indexOf('Е');
    expect(eIndex).toBeGreaterThanOrEqual(0);
    expect(ru[eIndex + 1]).toBe('Ё');
    expect(ru[eIndex + 2]).toBe('Ж');
  });
});

describe('alphabetGridColumns', () => {
  it.each(ALL_LANGUAGES)('%s has a positive column count', (lang) => {
    expect(alphabetGridColumns[lang]).toBeGreaterThan(0);
  });

  it('every language in alphabets has a matching column count', () => {
    for (const lang of ALL_LANGUAGES) {
      expect(alphabets[lang]).toBeDefined();
      expect(alphabetGridColumns[lang]).toBeDefined();
    }
  });
});
