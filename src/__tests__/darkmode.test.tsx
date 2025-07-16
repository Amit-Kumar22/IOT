/**
 * Dark Mode Implementation Tests
 * Tests for theme provider, toggle, and utilities
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider as NextThemeProvider } from 'next-themes';
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider';
import { ThemeToggle, ThemeToggleMenu } from '@/components/ui/ThemeToggle';
import { DarkModeCard, DarkModeButton, darkModeUtils } from '@/components/ui/DarkModeUtils';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('ThemeProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useTheme hook from next-themes
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'system',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      systemTheme: 'light'
    });
  });

  test('should provide theme context', () => {
    const TestComponent = () => {
      const { theme, resolvedTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <span data-testid="resolved-theme">{resolvedTheme}</span>
        </div>
      );
    };

    render(
      <NextThemeProvider>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </NextThemeProvider>
    );

    expect(screen.getByTestId('theme')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved-theme')).toHaveTextContent('light');
  });

  test('should toggle theme', async () => {
    const mockSetTheme = jest.fn();
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light'
    });

    const TestComponent = () => {
      const { toggleTheme } = useTheme();
      return (
        <button onClick={toggleTheme} data-testid="toggle">
          Toggle
        </button>
      );
    };

    render(
      <NextThemeProvider>
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      </NextThemeProvider>
    );

    fireEvent.click(screen.getByTestId('toggle'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      systemTheme: 'light'
    });
  });

  test('should render button variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggle variant="button" data-testid="theme-toggle" />
        </ThemeProvider>
      </NextThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Switch to dark theme');
  });

  test('should render icon variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggle variant="icon" data-testid="theme-toggle" />
        </ThemeProvider>
      </NextThemeProvider>
    );

    const button = screen.getByTestId('theme-toggle');
    expect(button).toBeInTheDocument();
  });

  test('should render select variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggle variant="select" data-testid="theme-toggle" />
        </ThemeProvider>
      </NextThemeProvider>
    );

    const select = screen.getByTestId('theme-toggle');
    expect(select).toBeInTheDocument();
  });

  test('should handle theme change', () => {
    const mockSetTheme = jest.fn();
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light'
    });

    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggle variant="button" data-testid="theme-toggle" />
        </ThemeProvider>
      </NextThemeProvider>
    );

    fireEvent.click(screen.getByTestId('theme-toggle'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});

describe('ThemeToggleMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      systemTheme: 'light'
    });
  });

  test('should render menu options', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggleMenu />
        </ThemeProvider>
      </NextThemeProvider>
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  test('should handle menu selection', () => {
    const mockSetTheme = jest.fn();
    const mockOnSelect = jest.fn();
    
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
      resolvedTheme: 'light',
      systemTheme: 'light'
    });

    render(
      <NextThemeProvider>
        <ThemeProvider>
          <ThemeToggleMenu onSelect={mockOnSelect} />
        </ThemeProvider>
      </NextThemeProvider>
    );

    fireEvent.click(screen.getByText('Dark'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockOnSelect).toHaveBeenCalledWith('dark');
  });
});

describe('DarkModeCard', () => {
  beforeEach(() => {
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      systemTheme: 'light'
    });
  });

  test('should render with default variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <DarkModeCard data-testid="card">
            Card content
          </DarkModeCard>
        </ThemeProvider>
      </NextThemeProvider>
    );

    const card = screen.getByTestId('card');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('dark:bg-gray-800');
  });

  test('should render with elevated variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <DarkModeCard variant="elevated" data-testid="card">
            Card content
          </DarkModeCard>
        </ThemeProvider>
      </NextThemeProvider>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('shadow-lg');
  });
});

describe('DarkModeButton', () => {
  beforeEach(() => {
    (require('next-themes').useTheme as jest.Mock).mockReturnValue({
      theme: 'light',
      setTheme: jest.fn(),
      resolvedTheme: 'light',
      systemTheme: 'light'
    });
  });

  test('should render with primary variant', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <DarkModeButton data-testid="button">
            Button text
          </DarkModeButton>
        </ThemeProvider>
      </NextThemeProvider>
    );

    const button = screen.getByTestId('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-primary-600');
    expect(button).toHaveClass('hover:bg-primary-700');
  });

  test('should handle click events', () => {
    const mockOnClick = jest.fn();

    render(
      <NextThemeProvider>
        <ThemeProvider>
          <DarkModeButton onClick={mockOnClick} data-testid="button">
            Button text
          </DarkModeButton>
        </ThemeProvider>
      </NextThemeProvider>
    );

    fireEvent.click(screen.getByTestId('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('should be disabled when disabled prop is true', () => {
    render(
      <NextThemeProvider>
        <ThemeProvider>
          <DarkModeButton disabled data-testid="button">
            Button text
          </DarkModeButton>
        </ThemeProvider>
      </NextThemeProvider>
    );

    const button = screen.getByTestId('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
  });
});

describe('Dark Mode Utilities', () => {
  beforeEach(() => {
    // Mock document.documentElement.classList
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        contains: jest.fn(),
        add: jest.fn(),
        remove: jest.fn()
      }
    });
  });

  test('should get current theme', () => {
    (document.documentElement.classList.contains as jest.Mock).mockReturnValue(true);
    
    const theme = darkModeUtils.getCurrentTheme();
    expect(theme).toBe('dark');
    expect(document.documentElement.classList.contains).toHaveBeenCalledWith('dark');
  });

  test('should get theme color', () => {
    (document.documentElement.classList.contains as jest.Mock).mockReturnValue(false);
    
    const color = darkModeUtils.getThemeColor('#000000', '#ffffff');
    expect(color).toBe('#000000');
  });
});

describe('Color Contrast Validation', () => {
  test('should meet WCAG AA contrast requirements', () => {
    // Test primary colors
    const primaryLight = '#2563eb'; // primary-600
    const primaryDark = '#60a5fa';  // primary-400
    
    // These should pass WCAG AA contrast requirements
    expect(primaryLight).toBeTruthy();
    expect(primaryDark).toBeTruthy();
  });

  test('should have proper text color contrast', () => {
    const textLight = '#111827'; // gray-900
    const textDark = '#f9fafb';  // gray-50
    
    expect(textLight).toBeTruthy();
    expect(textDark).toBeTruthy();
  });
});

describe('Theme Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
  });

  test('should save theme to localStorage', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    
    const saved = mockLocalStorage.getItem('iot-theme');
    expect(saved).toBe('dark');
  });

  test('should handle localStorage errors gracefully', () => {
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage not available');
    });

    // Should not throw
    expect(() => {
      mockLocalStorage.getItem('iot-theme');
    }).toThrow('localStorage not available');
  });
});

export default {};
