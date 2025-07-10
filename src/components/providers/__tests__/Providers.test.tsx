import { render, screen } from '@testing-library/react';
import { Providers } from '../Providers';

// Mock next-themes
jest.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock Redux store
jest.mock('@/store', () => ({
  store: {
    getState: jest.fn(() => ({})),
    dispatch: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    replaceReducer: jest.fn(),
  },
}));

// Mock Redux Persist
jest.mock('redux-persist', () => ({
  persistStore: jest.fn(() => ({
    purge: jest.fn(),
    flush: jest.fn(),
    pause: jest.fn(),
    persist: jest.fn(),
    getState: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
  })),
}));

// Mock PersistGate
jest.mock('redux-persist/integration/react', () => ({
  PersistGate: ({ children }: { children: React.ReactNode }) => children,
}));

describe('Providers Component', () => {
  it('should render children correctly', () => {
    const testText = 'Test Child Component';
    
    render(
      <Providers>
        <div>{testText}</div>
      </Providers>
    );

    expect(screen.getByText(testText)).toBeInTheDocument();
  });

  it('should wrap children with Redux Provider', () => {
    const testId = 'test-child';
    
    render(
      <Providers>
        <div data-testid={testId}>Test Content</div>
      </Providers>
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();
  });

  it('should wrap children with Theme Provider', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );

    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('should render without errors', () => {
    expect(() => {
      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );
    }).not.toThrow();
  });
});
