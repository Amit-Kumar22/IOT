import React from 'react';
import { layoutClasses, spacingClasses, visibilityClasses } from '@/lib/breakpoints';

/**
 * Responsive Container Component
 * Provides consistent responsive padding and max-width
 */
interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  [key: string]: any;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
  ...props
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full'
  };

  return (
    <div className={`${layoutClasses.container} ${maxWidthClasses[maxWidth]} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Grid Component
 * Provides responsive grid layouts with configurable columns
 */
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  [key: string]: any;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md',
  className = '',
  ...props
}) => {
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-10'
  };

  const getGridClasses = () => {
    const classes = ['grid'];
    
    if (columns.default) classes.push(`grid-cols-${columns.default}`);
    if (columns.sm) classes.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) classes.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) classes.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) classes.push(`xl:grid-cols-${columns.xl}`);
    if (columns['2xl']) classes.push(`2xl:grid-cols-${columns['2xl']}`);
    
    return classes.join(' ');
  };

  return (
    <div className={`${getGridClasses()} ${gapClasses[gap]} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Card Component
 * Provides responsive padding and styling for cards
 */
interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  shadow?: 'sm' | 'md' | 'lg' | 'xl';
  [key: string]: any;
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className = '',
  hover = false,
  shadow = 'md',
  ...props
}) => {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const baseClasses = `
    bg-white dark:bg-gray-800 
    border border-gray-200 dark:border-gray-700 
    rounded-lg sm:rounded-xl 
    p-4 sm:p-6 lg:p-8 
    ${shadowClasses[shadow]}
    transition-all duration-200
  `;

  const hoverClasses = hover ? 'hover:shadow-lg hover:-translate-y-1' : '';

  return (
    <div className={`${baseClasses} ${hoverClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

/**
 * Responsive Text Component
 * Provides responsive typography scaling
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'small';
  className?: string;
  as?: React.ElementType;
  [key: string]: any;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className = '',
  as,
  ...props
}) => {
  const variantClasses = {
    h1: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold',
    h4: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h5: 'text-base sm:text-lg md:text-xl lg:text-2xl font-medium',
    h6: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
    body: 'text-sm sm:text-base md:text-lg',
    caption: 'text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400',
    small: 'text-xs sm:text-sm text-gray-500 dark:text-gray-500'
  };

  const Component = as || (variant.startsWith('h') ? variant : 'p');

  return React.createElement(
    Component,
    { className: `${variantClasses[variant]} ${className}`, ...props },
    children
  );
};

/**
 * Responsive Button Component
 * Provides responsive button sizes and touch targets
 */
interface ResponsiveButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any;
}

export const ResponsiveButton: React.FC<ResponsiveButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm sm:px-4 sm:py-2',
    md: 'px-4 py-2 text-base sm:px-6 sm:py-3',
    lg: 'px-6 py-3 text-lg sm:px-8 sm:py-4'
  };

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    min-h-[44px] min-w-[44px]
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

/**
 * Responsive Image Component
 * Provides responsive image sizing and lazy loading
 */
interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2';
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  aspectRatio
}) => {
  const aspectRatioClasses = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:2': 'aspect-[3/2]'
  };

  const baseClasses = `
    w-full h-auto
    object-cover
    transition-opacity duration-200
  `;

  const aspectClass = aspectRatio ? aspectRatioClasses[aspectRatio] : '';

  return (
    <div className={`${aspectClass} overflow-hidden`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        className={`${baseClasses} ${className}`}
      />
    </div>
  );
};

/**
 * Responsive Navigation Component
 * Provides responsive navigation with mobile menu support
 */
interface ResponsiveNavigationProps {
  items: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    current?: boolean;
  }>;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  items,
  className = '',
  orientation = 'horizontal'
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-2 sm:space-x-4',
    vertical: 'flex flex-col space-y-2'
  };

  const linkClasses = `
    flex items-center gap-2
    px-3 py-2 sm:px-4 sm:py-2
    text-sm sm:text-base
    font-medium
    rounded-lg
    transition-colors duration-200
    min-h-[44px]
  `;

  const activeClasses = 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300';
  const inactiveClasses = 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800';

  return (
    <nav className={`${orientationClasses[orientation]} ${className}`}>
      {items.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className={`${linkClasses} ${item.current ? activeClasses : inactiveClasses}`}
        >
          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
          <span className={orientation === 'horizontal' ? visibilityClasses.hideOnMobile : ''}>
            {item.label}
          </span>
        </a>
      ))}
    </nav>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveCard,
  ResponsiveText,
  ResponsiveButton,
  ResponsiveImage,
  ResponsiveNavigation
};
