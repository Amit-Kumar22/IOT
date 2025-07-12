// Shared constants for Task 6: Components and Reusables

/**
 * Device type constants
 */
export const DEVICE_TYPES = {
  LIGHT: 'light',
  THERMOSTAT: 'thermostat',
  SECURITY: 'security',
  SENSOR: 'sensor',
  APPLIANCE: 'appliance',
  INDUSTRIAL: 'industrial'
} as const;

/**
 * Device status constants
 */
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

/**
 * Chart type constants
 */
export const CHART_TYPES = {
  LINE: 'line',
  BAR: 'bar',
  PIE: 'pie',
  AREA: 'area',
  GAUGE: 'gauge',
  SCATTER: 'scatter'
} as const;

/**
 * Chart color schemes
 */
export const CHART_COLORS = {
  PRIMARY: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
  SUCCESS: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
  WARNING: ['#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
  ERROR: ['#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2'],
  INFO: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
  ENERGY: ['#10B981', '#F59E0B', '#EF4444'],
  TEMPERATURE: ['#3B82F6', '#8B5CF6', '#EF4444'],
  GRADIENT: [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  ]
} as const;

/**
 * Notification type constants
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  SUCCESS: 'success'
} as const;

/**
 * Notification priority constants
 */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

/**
 * Component size constants
 */
export const COMPONENT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

/**
 * Button variant constants
 */
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  DANGER: 'danger'
} as const;

/**
 * Badge variant constants
 */
export const BADGE_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  DANGER: 'danger',
  INFO: 'info'
} as const;

/**
 * Card shadow constants
 */
export const CARD_SHADOWS = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

/**
 * Card padding constants
 */
export const CARD_PADDING = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

/**
 * Border radius constants
 */
export const BORDER_RADIUS = {
  NONE: 'none',
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
} as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
} as const;

/**
 * Breakpoint constants for responsive design
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  XXL: 1536
} as const;

/**
 * Z-index constants for layering
 */
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080
} as const;

/**
 * Energy unit constants
 */
export const ENERGY_UNITS = {
  WATT: 'W',
  KILOWATT: 'kW',
  MEGAWATT: 'MW',
  WATT_HOUR: 'Wh',
  KILOWATT_HOUR: 'kWh',
  MEGAWATT_HOUR: 'MWh'
} as const;

/**
 * Currency constants
 */
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  INR: 'INR'
} as const;

/**
 * Time format constants
 */
export const TIME_FORMATS = {
  SHORT: 'HH:mm',
  LONG: 'HH:mm:ss',
  TWELVE_HOUR: 'h:mm a',
  FULL: 'HH:mm:ss.SSS'
} as const;

/**
 * Date format constants
 */
export const DATE_FORMATS = {
  SHORT: 'MM/dd/yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd',
  FULL: 'EEEE, MMMM dd, yyyy',
  RELATIVE: 'relative'
} as const;

/**
 * Input type constants
 */
export const INPUT_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number',
  TEL: 'tel',
  URL: 'url',
  SEARCH: 'search',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime-local',
  FILE: 'file'
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_PHONE: 'Invalid phone number format',
  INVALID_URL: 'Invalid URL format',
  INVALID_NUMBER: 'Must be a valid number',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  INVALID_DATE: 'Invalid date format',
  VALUE_TOO_LOW: 'Value is too low',
  VALUE_TOO_HIGH: 'Value is too high',
  INVALID_FORMAT: 'Invalid format'
} as const;

/**
 * Loading states
 */
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

/**
 * Icon names for device types
 */
export const DEVICE_ICONS = {
  [DEVICE_TYPES.LIGHT]: 'lightbulb',
  [DEVICE_TYPES.THERMOSTAT]: 'thermometer',
  [DEVICE_TYPES.SECURITY]: 'shield',
  [DEVICE_TYPES.SENSOR]: 'activity',
  [DEVICE_TYPES.APPLIANCE]: 'zap',
  [DEVICE_TYPES.INDUSTRIAL]: 'settings'
} as const;

/**
 * Status colors for devices
 */
export const STATUS_COLORS = {
  [DEVICE_STATUS.ONLINE]: {
    bg: 'bg-green-100 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-700',
    indicator: 'bg-green-500'
  },
  [DEVICE_STATUS.OFFLINE]: {
    bg: 'bg-gray-100 dark:bg-gray-900',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-700',
    indicator: 'bg-gray-500'
  },
  [DEVICE_STATUS.WARNING]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-700',
    indicator: 'bg-yellow-500'
  },
  [DEVICE_STATUS.ERROR]: {
    bg: 'bg-red-100 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-700',
    indicator: 'bg-red-500'
  }
} as const;

/**
 * Notification colors
 */
export const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.INFO]: {
    bg: 'bg-blue-50 dark:bg-blue-900',
    text: 'text-blue-800 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-700',
    icon: 'text-blue-500'
  },
  [NOTIFICATION_TYPES.SUCCESS]: {
    bg: 'bg-green-50 dark:bg-green-900',
    text: 'text-green-800 dark:text-green-200',
    border: 'border-green-200 dark:border-green-700',
    icon: 'text-green-500'
  },
  [NOTIFICATION_TYPES.WARNING]: {
    bg: 'bg-yellow-50 dark:bg-yellow-900',
    text: 'text-yellow-800 dark:text-yellow-200',
    border: 'border-yellow-200 dark:border-yellow-700',
    icon: 'text-yellow-500'
  },
  [NOTIFICATION_TYPES.ERROR]: {
    bg: 'bg-red-50 dark:bg-red-900',
    text: 'text-red-800 dark:text-red-200',
    border: 'border-red-200 dark:border-red-700',
    icon: 'text-red-500'
  }
} as const;

/**
 * Priority colors for notifications
 */
export const PRIORITY_COLORS = {
  [NOTIFICATION_PRIORITIES.LOW]: 'text-gray-500',
  [NOTIFICATION_PRIORITIES.MEDIUM]: 'text-blue-500',
  [NOTIFICATION_PRIORITIES.HIGH]: 'text-yellow-500',
  [NOTIFICATION_PRIORITIES.CRITICAL]: 'text-red-500'
} as const;

/**
 * Common CSS classes for reusability
 */
export const COMMON_CLASSES = {
  // Flexbox utilities
  FLEX_CENTER: 'flex items-center justify-center',
  FLEX_BETWEEN: 'flex items-center justify-between',
  FLEX_START: 'flex items-center justify-start',
  FLEX_END: 'flex items-center justify-end',
  
  // Grid utilities
  GRID_COLS_AUTO: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  GRID_COLS_FIXED: 'grid grid-cols-12',
  
  // Spacing utilities
  SPACING_SM: 'gap-2 p-2',
  SPACING_MD: 'gap-4 p-4',
  SPACING_LG: 'gap-6 p-6',
  
  // Typography utilities
  TEXT_HEADING: 'text-2xl font-bold text-gray-900 dark:text-white',
  TEXT_SUBHEADING: 'text-lg font-semibold text-gray-700 dark:text-gray-300',
  TEXT_BODY: 'text-base text-gray-600 dark:text-gray-400',
  TEXT_CAPTION: 'text-sm text-gray-500 dark:text-gray-500',
  
  // Border utilities
  BORDER_DEFAULT: 'border border-gray-200 dark:border-gray-700',
  BORDER_ROUNDED: 'rounded-lg',
  BORDER_ROUNDED_FULL: 'rounded-full',
  
  // Shadow utilities
  SHADOW_SM: 'shadow-sm',
  SHADOW_MD: 'shadow-md',
  SHADOW_LG: 'shadow-lg',
  
  // Focus utilities
  FOCUS_RING: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none',
  FOCUS_VISIBLE: 'focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
  
  // Transition utilities
  TRANSITION_DEFAULT: 'transition-all duration-300 ease-in-out',
  TRANSITION_FAST: 'transition-all duration-150 ease-in-out',
  TRANSITION_SLOW: 'transition-all duration-500 ease-in-out',
  
  // Interactive utilities
  HOVER_LIFT: 'hover:transform hover:scale-105',
  HOVER_SHADOW: 'hover:shadow-lg',
  CURSOR_POINTER: 'cursor-pointer',
  CURSOR_NOT_ALLOWED: 'cursor-not-allowed',
  
  // Accessibility utilities
  SCREEN_READER_ONLY: 'sr-only',
  SKIP_LINK: 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 p-2 bg-white text-black'
} as const;

/**
 * Performance thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME_WARNING: 16, // 60fps = 16ms per frame
  RENDER_TIME_ERROR: 33, // 30fps = 33ms per frame
  BUNDLE_SIZE_WARNING: 250000, // 250KB
  BUNDLE_SIZE_ERROR: 500000, // 500KB
  MEMORY_USAGE_WARNING: 50000000, // 50MB
  MEMORY_USAGE_ERROR: 100000000 // 100MB
} as const;

/**
 * Accessibility constants
 */
export const ACCESSIBILITY = {
  CONTRAST_RATIO_AA: 4.5,
  CONTRAST_RATIO_AAA: 7,
  CONTRAST_RATIO_AA_LARGE: 3,
  MIN_TOUCH_TARGET_SIZE: 44, // 44px minimum touch target
  KEYBOARD_NAVIGATION_KEYS: ['Enter', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape', 'Tab'],
  ARIA_LIVE_REGIONS: ['polite', 'assertive', 'off'],
  ARIA_ROLES: ['button', 'link', 'tab', 'tabpanel', 'dialog', 'alert', 'status', 'progressbar']
} as const;

/**
 * Default component configurations
 */
export const DEFAULT_CONFIGS = {
  CHART_WIDGET: {
    height: 300,
    width: 400,
    theme: 'light',
    animations: true,
    showLegend: true,
    showGrid: true,
    colors: CHART_COLORS.PRIMARY
  },
  ENERGY_GAUGE: {
    size: 'medium',
    showNeedle: true,
    showLabels: true,
    animated: true,
    colorScheme: 'energy'
  },
  PRICING_TABLE: {
    currency: 'USD',
    billingCycle: 'monthly',
    showComparison: true
  },
  NOTIFICATION_PANEL: {
    maxHeight: 400,
    showUnreadOnly: false,
    groupByType: false,
    autoRefresh: true
  },
  DEVICE_CARD: {
    variant: 'detailed',
    showControls: true
  }
} as const;

/**
 * Test data for development and testing
 */
export const TEST_DATA = {
  MOCK_DEVICES: [
    {
      id: 'device-001',
      name: 'Living Room Light',
      type: 'light',
      status: 'online',
      batteryLevel: 0.85,
      signalStrength: 0.92,
      room: 'Living Room',
      lastSeen: new Date(),
      isControllable: true,
      currentState: { brightness: 75, color: '#ffffff' }
    },
    {
      id: 'device-002',
      name: 'Bedroom Thermostat',
      type: 'thermostat',
      status: 'online',
      signalStrength: 0.78,
      room: 'Bedroom',
      lastSeen: new Date(),
      isControllable: true,
      currentState: { temperature: 72, mode: 'heat' }
    }
  ],
  MOCK_CHART_DATA: [
    { label: 'Jan', value: 65, category: 'usage' },
    { label: 'Feb', value: 72, category: 'usage' },
    { label: 'Mar', value: 81, category: 'usage' },
    { label: 'Apr', value: 69, category: 'usage' },
    { label: 'May', value: 78, category: 'usage' },
    { label: 'Jun', value: 85, category: 'usage' }
  ],
  MOCK_NOTIFICATIONS: [
    {
      id: 'notif-001',
      type: 'warning',
      title: 'Device Offline',
      message: 'Kitchen sensor has been offline for 2 hours',
      timestamp: new Date(),
      isRead: false,
      priority: 'high',
      source: 'device-manager'
    },
    {
      id: 'notif-002',
      type: 'info',
      title: 'System Update',
      message: 'New firmware available for your devices',
      timestamp: new Date(),
      isRead: true,
      priority: 'medium',
      source: 'system'
    }
  ]
} as const;
