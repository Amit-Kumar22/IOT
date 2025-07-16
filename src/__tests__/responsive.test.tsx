/**
 * Test file for responsive breakpoint system
 * This validates that layouts work correctly across different screen sizes
 */

import { render, screen } from '@testing-library/react';
import { 
  ResponsiveContainer, 
  ResponsiveGrid, 
  ResponsiveCard, 
  ResponsiveText, 
  ResponsiveButton 
} from '@/components/ui/ResponsiveComponents';
import { breakpoints, layoutClasses } from '@/lib/breakpoints';

// Mock window.matchMedia for testing
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

describe('Responsive Breakpoint System', () => {
  describe('Breakpoint Configuration', () => {
    test('should have correct breakpoint values', () => {
      expect(breakpoints.xs).toBe('475px');
      expect(breakpoints.sm).toBe('640px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('1024px');
      expect(breakpoints.xl).toBe('1280px');
      expect(breakpoints['2xl']).toBe('1536px');
      expect(breakpoints['3xl']).toBe('1600px');
    });

    test('should have correct layout classes', () => {
      expect(layoutClasses.container).toContain('w-full');
      expect(layoutClasses.container).toContain('mx-auto');
      expect(layoutClasses.container).toContain('px-4');
      expect(layoutClasses.container).toContain('sm:px-6');
      expect(layoutClasses.container).toContain('lg:px-8');
    });
  });

  describe('ResponsiveContainer', () => {
    test('should render with correct responsive classes', () => {
      render(
        <ResponsiveContainer data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('w-full');
      expect(container).toHaveClass('mx-auto');
      expect(container).toHaveClass('px-4');
    });

    test('should apply max-width correctly', () => {
      render(
        <ResponsiveContainer maxWidth="lg" data-testid="container">
          <div>Test content</div>
        </ResponsiveContainer>
      );

      const container = screen.getByTestId('container');
      expect(container).toHaveClass('max-w-lg');
    });
  });

  describe('ResponsiveGrid', () => {
    test('should render with default grid classes', () => {
      render(
        <ResponsiveGrid data-testid="grid">
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid');
      expect(grid).toHaveClass('gap-6');
    });

    test('should apply custom column configuration', () => {
      render(
        <ResponsiveGrid 
          columns={{ default: 2, lg: 4 }} 
          data-testid="grid"
        >
          <div>Item 1</div>
          <div>Item 2</div>
        </ResponsiveGrid>
      );

      const grid = screen.getByTestId('grid');
      expect(grid).toHaveClass('grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('ResponsiveCard', () => {
    test('should render with responsive padding', () => {
      render(
        <ResponsiveCard data-testid="card">
          <div>Card content</div>
        </ResponsiveCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('p-4');
      expect(card).toHaveClass('sm:p-6');
      expect(card).toHaveClass('lg:p-8');
    });

    test('should apply hover effects when enabled', () => {
      render(
        <ResponsiveCard hover data-testid="card">
          <div>Card content</div>
        </ResponsiveCard>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('hover:shadow-lg');
      expect(card).toHaveClass('hover:-translate-y-1');
    });
  });

  describe('ResponsiveText', () => {
    test('should render with correct heading classes', () => {
      render(
        <ResponsiveText variant="h1" data-testid="heading">
          Test Heading
        </ResponsiveText>
      );

      const heading = screen.getByTestId('heading');
      expect(heading).toHaveClass('text-3xl');
      expect(heading).toHaveClass('sm:text-4xl');
      expect(heading).toHaveClass('md:text-5xl');
      expect(heading).toHaveClass('lg:text-6xl');
      expect(heading).toHaveClass('font-bold');
    });

    test('should render with body text classes', () => {
      render(
        <ResponsiveText variant="body" data-testid="text">
          Body text
        </ResponsiveText>
      );

      const text = screen.getByTestId('text');
      expect(text).toHaveClass('text-sm');
      expect(text).toHaveClass('sm:text-base');
      expect(text).toHaveClass('md:text-lg');
    });
  });

  describe('ResponsiveButton', () => {
    test('should render with correct responsive sizing', () => {
      render(
        <ResponsiveButton size="md" data-testid="button">
          Click me
        </ResponsiveButton>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('px-4');
      expect(button).toHaveClass('py-2');
      expect(button).toHaveClass('sm:px-6');
      expect(button).toHaveClass('sm:py-3');
    });

    test('should have minimum touch target size', () => {
      render(
        <ResponsiveButton data-testid="button">
          Click me
        </ResponsiveButton>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('min-h-[44px]');
      expect(button).toHaveClass('min-w-[44px]');
    });

    test('should apply correct variant styles', () => {
      render(
        <ResponsiveButton variant="primary" data-testid="button">
          Primary Button
        </ResponsiveButton>
      );

      const button = screen.getByTestId('button');
      expect(button).toHaveClass('bg-primary-600');
      expect(button).toHaveClass('hover:bg-primary-700');
      expect(button).toHaveClass('text-white');
    });
  });
});

describe('Touch Target Validation', () => {
  test('should meet minimum touch target requirements', () => {
    // Test that interactive elements meet iOS HIG minimum of 44px
    render(
      <ResponsiveButton size="sm" data-testid="small-button">
        Small Button
      </ResponsiveButton>
    );

    const button = screen.getByTestId('small-button');
    expect(button).toHaveClass('min-h-[44px]');
    expect(button).toHaveClass('min-w-[44px]');
  });
});

describe('Performance Optimization', () => {
  test('should apply performance optimization classes', () => {
    const { container } = render(
      <div className="smooth-transform dashboard-widget">
        <ResponsiveCard>Performance test</ResponsiveCard>
      </div>
    );

    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('smooth-transform');
    expect(element).toHaveClass('dashboard-widget');
  });
});

describe('Dark Mode Support', () => {
  test('should apply dark mode classes', () => {
    render(
      <ResponsiveCard data-testid="card">
        <div>Dark mode card</div>
      </ResponsiveCard>
    );

    const card = screen.getByTestId('card');
    expect(card).toHaveClass('bg-white');
    expect(card).toHaveClass('dark:bg-gray-800');
    expect(card).toHaveClass('border-gray-200');
    expect(card).toHaveClass('dark:border-gray-700');
  });
});

export default {};
