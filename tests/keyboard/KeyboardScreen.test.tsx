import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KeyboardScreen from '../../src/components/screens/KeyboardScreen';

function renderKeyboard() {
  const onClose = vi.fn();
  const utils = render(<KeyboardScreen onClose={onClose} />);
  return { ...utils, onClose };
}

function getMessage(): string {
  return screen.getByTestId('keyboard-message').textContent?.replace(/\u00A0/g, '').trim() ?? '';
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('KeyboardScreen – User Story 1: type and show', () => {
  it('renders an empty message display and a letter grid', () => {
    renderKeyboard();
    expect(
      screen.getByRole('dialog', { name: /keyboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Z' })).toBeInTheDocument();
    expect(getMessage()).toBe('');
  });

  it('tapping letters appends to the message display', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    for (const letter of ['W', 'A', 'T', 'E', 'R']) {
      await user.click(screen.getByRole('button', { name: letter }));
    }
    expect(getMessage()).toBe('WATER');
  });

  it('tapping the space key inserts a space between words', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'H' }));
    await user.click(screen.getByRole('button', { name: 'I' }));
    await user.click(screen.getByRole('button', { name: /^space$/i }));
    await user.click(screen.getByRole('button', { name: 'M' }));
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(screen.getByRole('button', { name: 'M' }));
    expect(getMessage()).toBe('HI MOM');
  });

  it('Show opens a large-text takeover with the typed message', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'H' }));
    await user.click(screen.getByRole('button', { name: 'I' }));
    await user.click(screen.getByRole('button', { name: /^show$/i }));
    const takeover = await screen.findByRole('dialog', { name: /^show$/i });
    expect(within(takeover).getByText('HI')).toBeInTheDocument();
  });

  it('tapping the takeover dismisses it and preserves the typed text', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'O' }));
    await user.click(screen.getByRole('button', { name: 'K' }));
    await user.click(screen.getByRole('button', { name: /^show$/i }));
    const takeover = await screen.findByRole('dialog', { name: /^show$/i });
    await user.click(takeover);
    expect(
      screen.queryByRole('dialog', { name: /^show$/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('dialog', { name: /keyboard/i }),
    ).toBeInTheDocument();
    expect(getMessage()).toBe('OK');
  });
});

describe('KeyboardScreen – User Story 2: backspace', () => {
  it('removes exactly the last character when backspace is tapped', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    for (const letter of ['H', 'E', 'L', 'L', 'X']) {
      await user.click(screen.getByRole('button', { name: letter }));
    }
    await user.click(screen.getByRole('button', { name: /backspace/i }));
    expect(getMessage()).toBe('HELL');
    await user.click(screen.getByRole('button', { name: 'O' }));
    expect(getMessage()).toBe('HELLO');
  });

  it('backspace on an empty message is a no-op', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: /backspace/i }));
    await user.click(screen.getByRole('button', { name: /backspace/i }));
    expect(getMessage()).toBe('');
  });
});

describe('KeyboardScreen – User Story 3: language switcher', () => {
  it('opens a list of configured languages when the switcher is tapped', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: /change language/i }));
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox).getByRole('option', { name: 'English' }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'עברית' }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'العربية' }),
    ).toBeInTheDocument();
    expect(
      within(listbox).getByRole('option', { name: 'Русский' }),
    ).toBeInTheDocument();
  });

  it('switching language replaces the grid and preserves typed text', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'H' }));
    await user.click(screen.getByRole('button', { name: 'I' }));
    await user.click(screen.getByRole('button', { name: /change language/i }));
    await user.click(screen.getByRole('option', { name: 'עברית' }));

    // Hebrew grid is now rendered.
    expect(screen.getByRole('button', { name: 'א' })).toBeInTheDocument();
    // English letters are gone.
    expect(
      screen.queryByRole('button', { name: 'Q' }),
    ).not.toBeInTheDocument();
    // Previously typed text is preserved.
    expect(getMessage()).toBe('HI');
    // New input appends using the Hebrew letter.
    await user.click(screen.getByRole('button', { name: 'א' }));
    expect(getMessage()).toBe('HIא');
  });

  it('selecting a language closes the listbox', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: /change language/i }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByRole('option', { name: 'Русский' }));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});

describe('KeyboardScreen – User Story 4 and edge cases', () => {
  it('clear empties the message', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'H' }));
    await user.click(screen.getByRole('button', { name: 'I' }));
    await user.click(screen.getByRole('button', { name: /clear/i }));
    expect(getMessage()).toBe('');
  });

  it('Show is disabled when the message is empty', () => {
    renderKeyboard();
    const showBtn = screen.getByRole('button', { name: /^show$/i });
    expect(showBtn).toBeDisabled();
  });

  it('Show becomes enabled after typing at least one character', async () => {
    const user = userEvent.setup();
    renderKeyboard();
    expect(screen.getByRole('button', { name: /^show$/i })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'A' }));
    expect(screen.getByRole('button', { name: /^show$/i })).toBeEnabled();
  });

  it('Close button calls onClose', async () => {
    const user = userEvent.setup();
    const { onClose } = renderKeyboard();
    // The keyboard dialog has a Close button in its top bar.
    const keyboardDialog = screen.getByRole('dialog', { name: /keyboard/i });
    const closeBtn = within(keyboardDialog).getAllByRole('button', {
      name: /close/i,
    })[0];
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets message state when the component unmounts and remounts', async () => {
    const user = userEvent.setup();
    const { unmount } = renderKeyboard();
    await user.click(screen.getByRole('button', { name: 'Z' }));
    expect(getMessage()).toBe('Z');
    unmount();
    render(<KeyboardScreen onClose={vi.fn()} />);
    expect(getMessage()).toBe('');
  });

  it('enforces the 200 character maximum', () => {
    renderKeyboard();
    const aKey = screen.getByRole('button', { name: 'A' });
    for (let i = 0; i < 205; i++) {
      fireEvent.click(aKey);
    }
    const display = screen.getByTestId('keyboard-message');
    expect(display.textContent?.length).toBe(200);
  });

  it('does not log typed message content to the console', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const user = userEvent.setup();
    renderKeyboard();
    const secret = 'SECRET';
    for (const letter of secret) {
      await user.click(screen.getByRole('button', { name: letter }));
    }
    await user.click(screen.getByRole('button', { name: /^show$/i }));

    for (const spy of [logSpy, infoSpy, warnSpy, errSpy]) {
      for (const call of spy.mock.calls) {
        const joined = call.map(String).join(' ');
        expect(joined).not.toContain(secret);
      }
    }
  });

  it('does not write the typed message to localStorage or call fetch', async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const fetchSpy = vi.fn();
    const originalFetch = globalThis.fetch;
    // @ts-expect-error - deliberate test-only override of fetch
    globalThis.fetch = fetchSpy;

    try {
      const user = userEvent.setup();
      renderKeyboard();
      const secret = 'SECRET';
      for (const letter of secret) {
        await user.click(screen.getByRole('button', { name: letter }));
      }
      await user.click(screen.getByRole('button', { name: /^show$/i }));

      for (const call of setItemSpy.mock.calls) {
        for (const arg of call) {
          expect(String(arg)).not.toContain(secret);
        }
      }
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
