'use client';

import { ThemeProvider } from 'next-themes';
import { ReduxProvider } from './redux-provider';
import { ToastProvider } from './ToastProvider';

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Main providers component that wraps the application with necessary providers
 * - Redux Provider with persistence for state management
 * - Theme Provider for dark/light mode
 * - Toast Provider for notifications
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}
