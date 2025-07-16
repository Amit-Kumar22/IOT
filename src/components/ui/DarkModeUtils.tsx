/**
 * Dark Mode Utilities
 * Provides utility functions and components for dark mode support
 */
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';

/**
 * Dark Mode Wrapper Component
 * Conditionally renders content based on theme
 */
interface DarkModeWrapperProps {
  children: React.ReactNode;
  darkContent?: React.ReactNode;
  lightContent?: React.ReactNode;
  className?: string;
}

export const DarkModeWrapper: React.FC<DarkModeWrapperProps> = ({
  children,
  darkContent,
  lightContent,
  className = ''
}) => {
  const { resolvedTheme } = useTheme();

  if (darkContent && lightContent) {
    return (
      <div className={className}>
        {resolvedTheme === 'dark' ? darkContent : lightContent}
      </div>
    );
  }

  return (
    <div className={`dark-mode-transition ${className}`}>
      {children}
    </div>
  );
};

/**
 * Theme-Aware Image Component
 * Displays different images for light/dark themes
 */
interface ThemeAwareImageProps {
  lightSrc: string;
  darkSrc: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const ThemeAwareImage: React.FC<ThemeAwareImageProps> = ({
  lightSrc,
  darkSrc,
  alt,
  className = '',
  width,
  height
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <img
      src={resolvedTheme === 'dark' ? darkSrc : lightSrc}
      alt={alt}
      className={`dark-mode-transition ${className}`}
      width={width}
      height={height}
    />
  );
};

/**
 * Theme-Aware Icon Component
 * Displays different colors for light/dark themes
 */
interface ThemeAwareIconProps {
  icon: React.ComponentType<any>;
  lightColor?: string;
  darkColor?: string;
  className?: string;
  size?: number;
}

export const ThemeAwareIcon: React.FC<ThemeAwareIconProps> = ({
  icon: Icon,
  lightColor = 'text-gray-600',
  darkColor = 'text-gray-400',
  className = '',
  size = 20
}) => {
  return (
    <Icon
      className={`${lightColor} dark:${darkColor} dark-mode-transition ${className}`}
      width={size}
      height={size}
    />
  );
};

/**
 * Dark Mode Card Component
 * Pre-styled card with dark mode support
 */
interface DarkModeCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
}

export const DarkModeCard: React.FC<DarkModeCardProps> = ({
  children,
  className = '',
  variant = 'default'
}) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50'
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        rounded-lg p-6
        dark-mode-transition
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * Dark Mode Button Component
 * Pre-styled button with dark mode support
 */
interface DarkModeButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const DarkModeButton: React.FC<DarkModeButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false
}) => {
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    outline: 'bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        dark-mode-transition
        ${className}
      `}
    >
      {children}
    </button>
  );
};

/**
 * Dark Mode Input Component
 * Pre-styled input with dark mode support
 */
interface DarkModeInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export const DarkModeInput: React.FC<DarkModeInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        w-full px-3 py-2
        bg-white dark:bg-gray-800
        border border-gray-300 dark:border-gray-600
        rounded-lg
        text-gray-900 dark:text-gray-100
        placeholder-gray-500 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        dark-mode-transition
        ${className}
      `}
    />
  );
};

/**
 * Dark Mode Text Component
 * Pre-styled text with dark mode support
 */
interface DarkModeTextProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'muted' | 'accent';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  className?: string;
  as?: React.ElementType;
}

export const DarkModeText: React.FC<DarkModeTextProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  className = '',
  as: Component = 'p'
}) => {
  const variantClasses = {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-primary-600 dark:text-primary-400'
  };

  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        dark-mode-transition
        ${className}
      `}
    >
      {children}
    </Component>
  );
};

/**
 * Dark Mode Badge Component
 * Pre-styled badge with dark mode support
 */
interface DarkModeBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const DarkModeBadge: React.FC<DarkModeBadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  return (
    <span
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        inline-flex items-center
        rounded-full font-medium
        dark-mode-transition
        ${className}
      `}
    >
      {children}
    </span>
  );
};

/**
 * Dark Mode Utilities
 */
export const darkModeUtils = {
  /**
   * Get theme-aware color
   */
  getThemeColor: (lightColor: string, darkColor: string) => {
    if (typeof window === 'undefined') return lightColor;
    
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? darkColor : lightColor;
  },

  /**
   * Apply theme-aware styles
   */
  applyThemeStyles: (element: HTMLElement, lightStyles: any, darkStyles: any) => {
    if (typeof window === 'undefined') return;
    
    const isDark = document.documentElement.classList.contains('dark');
    const styles = isDark ? darkStyles : lightStyles;
    
    Object.assign(element.style, styles);
  },

  /**
   * Get current theme
   */
  getCurrentTheme: (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
};

export default {
  DarkModeWrapper,
  ThemeAwareImage,
  ThemeAwareIcon,
  DarkModeCard,
  DarkModeButton,
  DarkModeInput,
  DarkModeText,
  DarkModeBadge,
  darkModeUtils
};
