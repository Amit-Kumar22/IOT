'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import { ThemeProvider } from 'next-themes';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main providers component that wraps the application with necessary providers
 * - Redux Provider for state management
 * - Theme Provider for dark/light mode
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
}
