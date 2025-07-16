/**
 * Theme Toggle Component
 * Provides a button to toggle between light and dark themes
 */
'use client';

import React from 'react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon' | 'select';
  showLabel?: boolean;
  'data-testid'?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  size = 'md',
  variant = 'button',
  showLabel = false,
  'data-testid': testId
}) => {
  const { theme, setTheme, resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-sm',
    md: 'p-2 text-base',
    lg: 'p-3 text-lg'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-md
    transition-colors duration-200
    hover:bg-gray-100 dark:hover:bg-gray-800
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
    dark:focus:ring-offset-gray-800
  `;

  // Button variant - toggles between light/dark
  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
        data-testid={testId}
      >
        {resolvedTheme === 'dark' ? (
          <>
            <SunIcon className={iconSizes[size]} />
            {showLabel && <span className="ml-2">Light</span>}
          </>
        ) : (
          <>
            <MoonIcon className={iconSizes[size]} />
            {showLabel && <span className="ml-2">Dark</span>}
          </>
        )}
      </button>
    );
  }

  // Icon variant - minimal icon-only toggle
  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`${baseClasses} ${sizeClasses[size]} ${className}`}
        aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
        data-testid={testId}
      >
        {resolvedTheme === 'dark' ? (
          <SunIcon className={iconSizes[size]} />
        ) : (
          <MoonIcon className={iconSizes[size]} />
        )}
      </button>
    );
  }

  // Select variant - dropdown with all options
  if (variant === 'select') {
    return (
      <div className={`relative ${className}`} data-testid={testId}>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
          className={`
            ${sizeClasses[size]}
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-md
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-primary-500
            pr-8
          `}
          aria-label="Select theme"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="system">System</option>
        </select>
      </div>
    );
  }

  return null;
};

/**
 * Theme Toggle Menu Component
 * Provides a menu with all theme options
 */
interface ThemeToggleMenuProps {
  className?: string;
  onSelect?: (theme: 'light' | 'dark' | 'system') => void;
}

export const ThemeToggleMenu: React.FC<ThemeToggleMenuProps> = ({
  className = '',
  onSelect
}) => {
  const { theme, setTheme } = useTheme();

  const handleSelect = (selectedTheme: 'light' | 'dark' | 'system') => {
    setTheme(selectedTheme);
    onSelect?.(selectedTheme);
  };

  const menuItems = [
    { value: 'light', label: 'Light', icon: SunIcon },
    { value: 'dark', label: 'Dark', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerDesktopIcon }
  ];

  return (
    <div className={`py-1 ${className}`}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isSelected = theme === item.value;
        
        return (
          <button
            key={item.value}
            onClick={() => handleSelect(item.value as 'light' | 'dark' | 'system')}
            className={`
              flex items-center w-full px-3 py-2 text-sm
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${isSelected 
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                : 'text-gray-700 dark:text-gray-300'
              }
            `}
          >
            <Icon className="mr-3 h-4 w-4" />
            {item.label}
            {isSelected && (
              <span className="ml-auto text-primary-500">✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Theme Status Indicator Component
 * Shows current theme status
 */
interface ThemeStatusProps {
  className?: string;
  showIcon?: boolean;
  showLabel?: boolean;
}

export const ThemeStatus: React.FC<ThemeStatusProps> = ({
  className = '',
  showIcon = true,
  showLabel = true
}) => {
  const { theme, resolvedTheme } = useTheme();

  const getThemeInfo = () => {
    if (theme === 'system') {
      return {
        label: `System (${resolvedTheme})`,
        icon: ComputerDesktopIcon,
        color: 'text-blue-600 dark:text-blue-400'
      };
    }
    
    if (resolvedTheme === 'dark') {
      return {
        label: 'Dark',
        icon: MoonIcon,
        color: 'text-gray-600 dark:text-gray-400'
      };
    }
    
    return {
      label: 'Light',
      icon: SunIcon,
      color: 'text-yellow-600 dark:text-yellow-400'
    };
  };

  const themeInfo = getThemeInfo();
  const Icon = themeInfo.icon;

  return (
    <div className={`flex items-center ${className}`}>
      {showIcon && <Icon className={`h-4 w-4 ${themeInfo.color}`} />}
      {showLabel && (
        <span className={`${showIcon ? 'ml-2' : ''} text-sm text-gray-600 dark:text-gray-400`}>
          {themeInfo.label}
        </span>
      )}
    </div>
  );
};

/**
 * Animated Theme Toggle Component
 * Provides a smooth animated toggle
 */
interface AnimatedThemeToggleProps {
  className?: string;
}

export const AnimatedThemeToggle: React.FC<AnimatedThemeToggleProps> = ({
  className = ''
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-1 rounded-full
        bg-gray-200 dark:bg-gray-700
        transition-colors duration-300
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-12 h-6">
        <div
          className={`
            absolute top-0.5 left-0.5
            w-5 h-5 rounded-full
            bg-white dark:bg-gray-900
            shadow-md
            transition-transform duration-300
            ${resolvedTheme === 'dark' ? 'translate-x-6' : 'translate-x-0'}
          `}
        />
        <div className="absolute inset-0 flex items-center justify-between px-1">
          <SunIcon className="h-4 w-4 text-yellow-500" />
          <MoonIcon className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
