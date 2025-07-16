/**
 * Responsive Breakpoint Configuration
 * Defines breakpoints and utilities for responsive design
 */

export const breakpoints = {
  xs: '475px',   // Small phones
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
  '3xl': '1600px'  // Ultra-wide displays
} as const;

export const deviceTypes = {
  mobile: 'max-width: 767px',
  tablet: 'min-width: 768px and max-width: 1023px',
  desktop: 'min-width: 1024px'
} as const;

/**
 * Mobile-First Responsive Strategy Classes
 */
export const layoutClasses = {
  container: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  sidebar: {
    mobile: 'fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out',
    desktop: 'fixed inset-y-0 left-0 z-50 w-64 lg:translate-x-0'
  },
  mainContent: {
    mobile: 'min-h-screen',
    desktop: 'lg:pl-64 min-h-screen'
  },
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',
    dashboardCards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
    deviceGrid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4',
    metricGrid: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4'
  }
};

/**
 * Responsive Typography Classes
 */
export const typographyClasses = {
  heading: {
    h1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    h2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    h3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    h4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
    h5: 'text-sm sm:text-base md:text-lg lg:text-xl font-medium',
    h6: 'text-xs sm:text-sm md:text-base lg:text-lg font-medium'
  },
  body: {
    large: 'text-base sm:text-lg md:text-xl',
    default: 'text-sm sm:text-base md:text-lg',
    small: 'text-xs sm:text-sm md:text-base'
  }
};

/**
 * Responsive Component Classes
 */
export const componentClasses = {
  button: {
    mobile: 'px-3 py-2 text-sm',
    tablet: 'px-4 py-2 text-base',
    desktop: 'px-6 py-3 text-lg'
  },
  card: {
    mobile: 'p-4 rounded-lg',
    tablet: 'p-6 rounded-xl',
    desktop: 'p-8 rounded-2xl'
  },
  deviceCard: {
    responsive: 'p-4 sm:p-6 lg:p-8 rounded-lg sm:rounded-xl lg:rounded-2xl'
  },
  navigation: {
    mobile: 'px-2 py-1 text-sm',
    desktop: 'px-4 py-2 text-base'
  }
};

/**
 * Responsive Spacing Classes
 */
export const spacingClasses = {
  section: {
    mobile: 'py-8 px-4',
    tablet: 'py-12 px-6',
    desktop: 'py-16 px-8'
  },
  container: {
    mobile: 'px-4',
    tablet: 'px-6',
    desktop: 'px-8'
  },
  gap: {
    mobile: 'gap-4',
    tablet: 'gap-6',
    desktop: 'gap-8'
  }
};

/**
 * Utility function to check if current screen size matches breakpoint
 */
export const useBreakpoint = (breakpoint: keyof typeof breakpoints) => {
  if (typeof window === 'undefined') return false;
  
  const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]})`);
  return mediaQuery.matches;
};

/**
 * Responsive visibility classes
 */
export const visibilityClasses = {
  hideOnMobile: 'hidden sm:block',
  hideOnTablet: 'block sm:hidden lg:block',
  hideOnDesktop: 'block lg:hidden',
  showOnMobile: 'block sm:hidden',
  showOnTablet: 'hidden sm:block lg:hidden',
  showOnDesktop: 'hidden lg:block'
};

/**
 * Touch-friendly classes for mobile devices
 */
export const touchClasses = {
  minTouchTarget: 'min-h-[44px] min-w-[44px]', // iOS HIG minimum
  tapHighlight: 'tap-highlight-transparent',
  touchAction: 'touch-action-manipulation'
};

/**
 * Responsive image classes
 */
export const imageClasses = {
  responsive: 'w-full h-auto',
  avatar: {
    mobile: 'w-8 h-8 sm:w-10 sm:h-10',
    large: 'w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20'
  },
  icon: {
    small: 'w-4 h-4 sm:w-5 sm:h-5',
    medium: 'w-5 h-5 sm:w-6 sm:h-6',
    large: 'w-6 h-6 sm:w-8 sm:h-8'
  }
};

/**
 * Dashboard-specific responsive classes
 */
export const dashboardClasses = {
  sidebar: {
    width: 'w-64 lg:w-72 xl:w-80',
    mobile: 'w-full sm:w-80'
  },
  header: {
    height: 'h-16 sm:h-20',
    padding: 'px-4 sm:px-6 lg:px-8'
  },
  main: {
    padding: 'p-4 sm:p-6 lg:p-8',
    margin: 'ml-0 lg:ml-64 xl:ml-72'
  },
  widget: {
    minHeight: 'min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]',
    responsive: 'col-span-1 sm:col-span-2 lg:col-span-1 xl:col-span-2'
  }
};

/**
 * Form responsive classes
 */
export const formClasses = {
  input: {
    mobile: 'px-3 py-2 text-sm',
    tablet: 'px-4 py-3 text-base',
    desktop: 'px-6 py-4 text-lg'
  },
  label: {
    mobile: 'text-sm font-medium',
    tablet: 'text-base font-medium',
    desktop: 'text-lg font-medium'
  },
  button: {
    mobile: 'px-4 py-2 text-sm',
    tablet: 'px-6 py-3 text-base',
    desktop: 'px-8 py-4 text-lg'
  }
};

/**
 * Data table responsive classes
 */
export const tableClasses = {
  container: 'overflow-x-auto sm:rounded-lg',
  table: 'min-w-full divide-y divide-gray-200 dark:divide-gray-700',
  header: 'bg-gray-50 dark:bg-gray-800',
  cell: {
    mobile: 'px-2 py-3 text-xs',
    tablet: 'px-4 py-4 text-sm',
    desktop: 'px-6 py-4 text-base'
  },
  hideOnMobile: 'hidden sm:table-cell',
  hideOnTablet: 'hidden lg:table-cell'
};

export default {
  breakpoints,
  deviceTypes,
  layoutClasses,
  typographyClasses,
  componentClasses,
  spacingClasses,
  visibilityClasses,
  touchClasses,
  imageClasses,
  dashboardClasses,
  formClasses,
  tableClasses,
  useBreakpoint
};
