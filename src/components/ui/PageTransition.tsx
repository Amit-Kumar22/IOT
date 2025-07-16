/**
 * PageTransition Component
 * Provides consistent page transitions across the IoT platform
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { animationVariants, reducedMotionVariants } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'default' | 'slide' | 'fade' | 'scale';
  className?: string;
  duration?: number;
  delay?: number;
  enableReducedMotion?: boolean;
}

/**
 * PageTransition Component
 * Wraps page content with smooth transitions
 */
export function PageTransition({
  children,
  variant = 'default',
  className = '',
  duration = 0.4,
  delay = 0,
  enableReducedMotion = true
}: PageTransitionProps) {
  const pathname = usePathname();
  
  // Check for reduced motion preference
  const prefersReducedMotion = enableReducedMotion && 
    typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const getVariant = () => {
    if (prefersReducedMotion) {
      return reducedMotionVariants.pageTransition;
    }

    switch (variant) {
      case 'slide':
        return animationVariants.slideLeft;
      case 'fade':
        return animationVariants.fadeIn;
      case 'scale':
        return animationVariants.scaleIn;
      default:
        return animationVariants.pageTransition;
    }
  };

  const customVariant = {
    ...getVariant(),
    visible: {
      ...getVariant().visible,
      transition: {
        duration,
        delay,
        ease: 'easeOut' as const
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={customVariant}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
        style={{
          willChange: 'transform, opacity'
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * PageTransitionProvider
 * Provides page transitions at the app level
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  return (
    <PageTransition variant="default" className="min-h-screen">
      {children}
    </PageTransition>
  );
}

/**
 * RouteTransition Component
 * For transitions between different routes
 */
export function RouteTransition({
  children,
  direction = 'forward',
  className = ''
}: {
  children: ReactNode;
  direction?: 'forward' | 'backward';
  className?: string;
}) {
  const pathname = usePathname();

  const routeVariants = {
    hidden: {
      opacity: 0,
      x: direction === 'forward' ? 20 : -20
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const
      }
    },
    exit: {
      opacity: 0,
      x: direction === 'forward' ? -20 : 20,
      transition: {
        duration: 0.3,
        ease: 'easeIn' as const
      }
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={routeVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * ModalTransition Component
 * For modal and dialog transitions
 */
export function ModalTransition({
  children,
  isOpen,
  onClose,
  className = ''
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={animationVariants.modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            variants={animationVariants.modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * DrawerTransition Component
 * For sidebar and drawer transitions
 */
export function DrawerTransition({
  children,
  isOpen,
  onClose,
  position = 'left',
  className = ''
}: {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  position?: 'left' | 'right' | 'top' | 'bottom';
  className?: string;
}) {
  const getDrawerVariants = () => {
    switch (position) {
      case 'right':
        return {
          hidden: { x: '100%' },
          visible: { x: 0 },
          exit: { x: '100%' }
        };
      case 'top':
        return {
          hidden: { y: '-100%' },
          visible: { y: 0 },
          exit: { y: '-100%' }
        };
      case 'bottom':
        return {
          hidden: { y: '100%' },
          visible: { y: 0 },
          exit: { y: '100%' }
        };
      default:
        return {
          hidden: { x: '-100%' },
          visible: { x: 0 },
          exit: { x: '-100%' }
        };
    }
  };

  const drawerVariants = {
    ...getDrawerVariants(),
    visible: {
      ...getDrawerVariants().visible,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    exit: {
      ...getDrawerVariants().exit,
      transition: { duration: 0.3, ease: 'easeIn' as const }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={animationVariants.drawerOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer Content */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed z-50 bg-white dark:bg-gray-800 ${className}`}
            style={{
              ...(position === 'left' && { left: 0, top: 0, bottom: 0 }),
              ...(position === 'right' && { right: 0, top: 0, bottom: 0 }),
              ...(position === 'top' && { top: 0, left: 0, right: 0 }),
              ...(position === 'bottom' && { bottom: 0, left: 0, right: 0 })
            }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * StaggeredList Component
 * For animating lists with staggered children
 */
export function StaggeredList({
  children,
  className = '',
  staggerDelay = 0.1,
  childDelay = 0.2
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  childDelay?: number;
}) {
  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay
      }
    }
  };

  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredItem Component
 * Individual item for staggered animations
 */
export function StaggeredItem({
  children,
  className = '',
  variant = 'fadeInUp'
}: {
  children: ReactNode;
  className?: string;
  variant?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn';
}) {
  const itemVariants = animationVariants[variant] || animationVariants.fadeInUp;

  return (
    <motion.div
      variants={itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * NotificationTransition Component
 * For toast and notification animations
 */
export function NotificationTransition({
  children,
  isVisible,
  position = 'top-right',
  className = ''
}: {
  children: ReactNode;
  isVisible: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  className?: string;
}) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={animationVariants.notificationSlide}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`fixed z-50 ${getPositionClasses()} ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default {
  PageTransition,
  PageTransitionProvider,
  RouteTransition,
  ModalTransition,
  DrawerTransition,
  StaggeredList,
  StaggeredItem,
  NotificationTransition
};
