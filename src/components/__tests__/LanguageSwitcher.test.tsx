import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NextI18nLanguageSwitcher } from '../NextI18nLanguageSwitcher';

// Mock next/router
const pushMock = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'fr',
    defaultLocale: 'fr',
    asPath: '/',
    push: pushMock,
  }),
}));

// Mock i18n for next-i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'fr' },
    t: (key: string) => key,
  }),
}));

describe('NextI18nLanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with current language and accessible button', () => {
    render(<NextI18nLanguageSwitcher />);
    const button = screen.getByLabelText('Changer de langue');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-haspopup', 'true');
  });

  it('shows language options when toggled', () => {
    render(<NextI18nLanguageSwitcher />);
    const button = screen.getByLabelText('Changer de langue');
    fireEvent.click(button);
    expect(screen.getByText('Français')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('changes language via router.push on selection', async () => {
    render(<NextI18nLanguageSwitcher />);
    const button = screen.getByLabelText('Changer de langue');
    fireEvent.click(button);

    const english = screen.getByText('English');
    fireEvent.click(english);

    expect(pushMock).toHaveBeenCalledWith('/', '/', { locale: 'en' });
  });
});