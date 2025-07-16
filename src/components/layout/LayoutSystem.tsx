/**
 * Layout System Components
 * Comprehensive layout components for IoT platform
 */

'use client';

import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { animationVariants } from '@/lib/animations';
import { useTheme } from 'next-themes';

/**
 * Layout Context
 */
interface LayoutContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

/**
 * LayoutProvider Component
 */
export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      
      // Auto-collapse sidebar on mobile
      if (width < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const value = {
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed,
    isMobile,
    isTablet,
    isDesktop
  };

  return (
    <LayoutContext.Provider value={value}>
      {children}
    </LayoutContext.Provider>
  );
}

/**
 * SidebarLayout Component
 * Main layout component with responsive sidebar
 */
export function SidebarLayout({
  children,
  sidebar,
  header,
  footer,
  className = ''
}: {
  children: ReactNode;
  sidebar: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, isMobile, isDesktop } = useLayout();
  const pathname = usePathname();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile, setSidebarOpen]);

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside className={`
          flex-shrink-0 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          bg-white dark:bg-gray-800 
          border-r border-gray-200 dark:border-gray-700
          shadow-sm
        `}>
          {sidebar}
        </aside>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="
                fixed inset-y-0 left-0 z-50 w-64
                bg-white dark:bg-gray-800
                border-r border-gray-200 dark:border-gray-700
                shadow-lg
              "
            >
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {header && (
          <header className="
            flex-shrink-0 h-16 
            bg-white dark:bg-gray-800 
            border-b border-gray-200 dark:border-gray-700
            shadow-sm
          ">
            {header}
          </header>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={pathname}
            variants={animationVariants.pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full"
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        {footer && (
          <footer className="
            flex-shrink-0 
            bg-white dark:bg-gray-800 
            border-t border-gray-200 dark:border-gray-700
            shadow-sm
          ">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/**
 * Sidebar Component
 * Responsive sidebar with navigation
 */
export function Sidebar({
  children,
  logo,
  className = ''
}: {
  children: ReactNode;
  logo?: ReactNode;
  className?: string;
}) {
  const { sidebarCollapsed, setSidebarCollapsed, isMobile } = useLayout();

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Logo Section */}
      {logo && (
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`transition-all duration-300 ${sidebarCollapsed ? 'scale-75' : ''}`}>
            {logo}
          </div>
        </div>
      )}

      {/* Navigation Content */}
      <nav className="flex-1 overflow-y-auto p-4">
        {children}
      </nav>

      {/* Collapse Toggle (Desktop Only) */}
      {!isMobile && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="
              w-full flex items-center justify-center p-2
              text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700
              rounded-lg transition-colors
            "
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            <svg
              className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * SidebarItem Component
 * Navigation item for sidebar
 */
export function SidebarItem({
  icon,
  label,
  href,
  isActive = false,
  onClick,
  badge,
  children,
  className = ''
}: {
  icon?: ReactNode;
  label: string;
  href?: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { sidebarCollapsed } = useLayout();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (children) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center p-3 rounded-lg transition-colors
          ${isActive 
            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
      >
        {/* Icon */}
        {icon && (
          <div className="flex-shrink-0 w-5 h-5 mr-3">
            {icon}
          </div>
        )}

        {/* Label */}
        {!sidebarCollapsed && (
          <span className="flex-1 text-left text-sm font-medium truncate">
            {label}
          </span>
        )}

        {/* Badge */}
        {badge && !sidebarCollapsed && (
          <div className="flex-shrink-0 ml-2">
            {badge}
          </div>
        )}

        {/* Expand Arrow */}
        {children && !sidebarCollapsed && (
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Submenu */}
      <AnimatePresence>
        {children && isExpanded && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="ml-8 mt-2 space-y-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {sidebarCollapsed && (
        <div className="fixed left-16 z-50 px-2 py-1 ml-2 text-xs bg-gray-900 text-white rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {label}
        </div>
      )}
    </div>
  );
}

/**
 * MobileNavigation Component
 * Bottom navigation for mobile devices
 */
export function MobileNavigation({
  items,
  className = ''
}: {
  items: Array<{
    id: string;
    icon: ReactNode;
    label: string;
    href: string;
    isActive?: boolean;
    onClick?: () => void;
  }>;
  className?: string;
}) {
  const { isMobile } = useLayout();

  if (!isMobile) return null;

  return (
    <nav className={`
      fixed bottom-0 left-0 right-0 z-40
      bg-white dark:bg-gray-800 
      border-t border-gray-200 dark:border-gray-700
      shadow-lg
      ${className}
    `}>
      <div className="flex items-center justify-around py-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            className={`
              flex flex-col items-center justify-center p-2 min-w-0 flex-1
              ${item.isActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
              }
            `}
          >
            <div className="w-6 h-6 mb-1">
              {item.icon}
            </div>
            <span className="text-xs font-medium truncate">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/**
 * Header Component
 * Top navigation header
 */
export function Header({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ''
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  const { setSidebarOpen, isMobile } = useLayout();

  return (
    <div className={`flex items-center justify-between h-full px-4 ${className}`}>
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Mobile Menu Toggle */}
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Title and Breadcrumbs */}
        <div className="min-w-0 flex-1">
          {breadcrumbs && (
            <nav className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center">
                  {index > 0 && (
                    <svg className="w-3 h-3 mx-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                  {crumb.href ? (
                    <a href={crumb.href} className="hover:text-gray-700 dark:hover:text-gray-300">
                      {crumb.label}
                    </a>
                  ) : (
                    <span>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          
          {title && (
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h1>
          )}
          
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right Section */}
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/**
 * DashboardGrid Component
 * Responsive grid layout for dashboard content
 */
export function DashboardGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 4,
  className = ''
}: {
  children: ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}) {
  const gridClasses = `
    grid gap-${gap}
    grid-cols-${columns.xs || 1}
    sm:grid-cols-${columns.sm || 2}
    md:grid-cols-${columns.md || 3}
    lg:grid-cols-${columns.lg || 4}
    xl:grid-cols-${columns.xl || 4}
  `;

  return (
    <div className={`${gridClasses} ${className}`}>
      {children}
    </div>
  );
}

/**
 * ContentContainer Component
 * Standard content container with padding
 */
export function ContentContainer({
  children,
  size = 'default',
  className = ''
}: {
  children: ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    default: 'max-w-7xl',
    lg: 'max-w-8xl',
    xl: 'max-w-9xl',
    full: 'max-w-none'
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 py-6 ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card Component
 * Standard card layout
 */
export function Card({
  children,
  header,
  footer,
  className = '',
  variant = 'default'
}: {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}) {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700'
  };

  return (
    <div className={`rounded-lg overflow-hidden ${variantClasses[variant]} ${className}`}>
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {header}
        </div>
      )}
      
      <div className="px-6 py-4">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          {footer}
        </div>
      )}
    </div>
  );
}

export default {
  LayoutProvider,
  SidebarLayout,
  Sidebar,
  SidebarItem,
  MobileNavigation,
  Header,
  DashboardGrid,
  ContentContainer,
  Card,
  useLayout
};
