/**
 * Animation System Configuration
 * Provides animation variants and utilities for framer-motion
 */

import { Variants } from 'framer-motion';

/**
 * Common animation variants for framer-motion
 */
export const animationVariants: Record<string, Variants> = {
  // Fade animations
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  fadeInUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    }
  },

  fadeInDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    }
  },

  fadeInLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    }
  },

  fadeInRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    }
  },

  // Scale animations
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  scaleInOut: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      transition: { duration: 0.2, ease: 'easeOut' } 
    },
    exit: { 
      scale: 0.8, 
      opacity: 0, 
      transition: { duration: 0.2, ease: 'easeIn' } 
    }
  },

  // Slide animations
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  slideLeft: {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  slideRight: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    }
  },

  // Stagger animations
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },

  staggerItem: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },

  // Page transitions
  pageTransition: {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.4, ease: 'easeOut' } 
    },
    exit: { 
      opacity: 0, 
      x: 20, 
      transition: { duration: 0.3, ease: 'easeIn' } 
    }
  },

  // Modal animations
  modalBackdrop: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.2 } 
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.2 } 
    }
  },

  modalContent: {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2, ease: 'easeIn' } 
    }
  },

  // Drawer animations
  drawerOverlay: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.3 } 
    },
    exit: { 
      opacity: 0, 
      transition: { duration: 0.3 } 
    }
  },

  drawerContent: {
    hidden: { x: '-100%' },
    visible: { 
      x: 0, 
      transition: { duration: 0.3, ease: 'easeOut' } 
    },
    exit: { 
      x: '-100%', 
      transition: { duration: 0.3, ease: 'easeIn' } 
    }
  },

  // IoT Device specific animations
  deviceConnect: {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },

  deviceDisconnect: {
    visible: { scale: 1, opacity: 1 },
    hidden: { 
      scale: 0.8, 
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  },

  pulseGlow: {
    initial: { 
      boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' 
    },
    animate: { 
      boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
      transition: { duration: 1, repeat: Infinity, ease: 'easeOut' }
    }
  },

  // Loading animations
  spinner: {
    animate: {
      rotate: 360,
      transition: { duration: 1, repeat: Infinity, ease: 'linear' }
    }
  },

  bounce: {
    animate: {
      y: [0, -10, 0],
      transition: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  // Hover animations
  hoverLift: {
    rest: { y: 0 },
    hover: { 
      y: -5,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  },

  hoverScale: {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2, ease: 'easeOut' }
    }
  },

  // Notification animations
  notificationSlide: {
    hidden: { opacity: 0, y: -50, scale: 0.3 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      scale: 0.3,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  }
};

/**
 * Animation timing configurations
 */
export const animationTimings = {
  fast: { duration: 0.15 },
  normal: { duration: 0.3 },
  slow: { duration: 0.5 },
  slower: { duration: 0.75 }
};

/**
 * Easing configurations
 */
export const easingConfigs = {
  ease: [0.25, 0.1, 0.25, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  spring: { type: 'spring', damping: 20, stiffness: 300 },
  springBounce: { type: 'spring', damping: 10, stiffness: 400 }
};

/**
 * Reduced motion variants
 * Provides minimal animations for users with motion sensitivity
 */
export const reducedMotionVariants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } }
  },

  slideUp: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } }
  },

  scaleIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } }
  },

  pageTransition: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.1 } },
    exit: { opacity: 0, transition: { duration: 0.1 } }
  }
};

/**
 * Device status animations
 */
export const deviceStatusAnimations = {
  online: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  offline: {
    animate: {
      opacity: [1, 0.5, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  warning: {
    animate: {
      y: [0, -2, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
    }
  },

  error: {
    animate: {
      x: [0, -2, 2, -2, 2, 0],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
    }
  }
};

/**
 * Chart animations
 */
export const chartAnimations = {
  lineGrow: {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.5, ease: 'easeOut' }
    }
  },

  barGrow: {
    hidden: { scaleY: 0, originY: 1 },
    visible: { 
      scaleY: 1,
      transition: { duration: 0.8, ease: 'easeOut' }
    }
  },

  pieSlice: {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  }
};

/**
 * Performance optimization settings
 */
export const performanceConfig = {
  // Use GPU acceleration
  willChange: 'transform, opacity',
  
  // Reduce motion for accessibility
  respectReducedMotion: true,
  
  // Optimize for mobile
  mobileOptimized: {
    duration: 0.2,
    ease: 'easeOut'
  }
};

export default {
  animationVariants,
  animationTimings,
  easingConfigs,
  reducedMotionVariants,
  deviceStatusAnimations,
  chartAnimations,
  performanceConfig
};
