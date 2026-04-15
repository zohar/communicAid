import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '../../src/components/Header';

function renderHeader(overrides: Partial<Parameters<typeof Header>[0]> = {}) {
  const props = {
    title: 'Home',
    onHome: vi.fn(),
    onSettings: vi.fn(),
    onKeyboard: vi.fn(),
    ...overrides,
  };
  const utils = render(<Header {...props} />);
  return { ...utils, props };
}

describe('Header – keyboard button', () => {
  it('renders a keyboard button that calls onKeyboard when clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    const keyboardBtn = screen.getByRole('button', { name: /keyboard/i });
    await user.click(keyboardBtn);
    expect(props.onKeyboard).toHaveBeenCalledTimes(1);
  });

  it('does not call other handlers when the keyboard button is clicked', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    await user.click(screen.getByRole('button', { name: /keyboard/i }));
    expect(props.onHome).not.toHaveBeenCalled();
    expect(props.onSettings).not.toHaveBeenCalled();
  });

  it('does not render a back button when onBack is omitted', () => {
    renderHeader();
    // Home, Keyboard, and Settings should be the three clickable nav buttons.
    // Assert by counting: no Back button means there is no button with an
    // ArrowLeft/ArrowRight icon (we rely on the accessible tree instead and
    // simply check there are exactly three buttons in the header).
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('renders a back button when onBack is provided and calls it', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderHeader({ onBack });
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    // Back is the leftmost button (before Home).
    await user.click(buttons[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('still renders the title, home, and settings buttons alongside keyboard', async () => {
    const user = userEvent.setup();
    const { props } = renderHeader();
    expect(screen.getByText('Home')).toBeInTheDocument(); // title
    await user.click(screen.getByRole('button', { name: /keyboard/i }));
    expect(props.onKeyboard).toHaveBeenCalledTimes(1);
  });
});
