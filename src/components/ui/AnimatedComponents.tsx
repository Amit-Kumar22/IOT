/**
 * AnimatedComponents
 * Pre-built animated components for the IoT platform
 */

'use client';

import { motion, useInView, useAnimation } from 'framer-motion';
import { useEffect, useRef, ReactNode, useState } from 'react';
import { animationVariants, deviceStatusAnimations } from '@/lib/animations';

/**
 * FadeInOnScroll Component
 * Animates content when it comes into view
 */
export function FadeInOnScroll({
  children,
  className = '',
  threshold = 0.1,
  once = true,
  variant = 'fadeInUp'
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
  once?: boolean;
  variant?: keyof typeof animationVariants;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { amount: threshold, once });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      variants={animationVariants[variant]}
      initial="hidden"
      animate={controls}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedCard Component
 * Card with hover and interaction animations
 */
export function AnimatedCard({
  children,
  className = '',
  hoverEffect = 'lift',
  clickEffect = 'scale',
  onClick
}: {
  children: ReactNode;
  className?: string;
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none';
  clickEffect?: 'scale' | 'pulse' | 'none';
  onClick?: () => void;
}) {
  const getHoverVariants = () => {
    switch (hoverEffect) {
      case 'lift':
        return animationVariants.hoverLift;
      case 'scale':
        return animationVariants.hoverScale;
      case 'glow':
        return {
          rest: { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
          hover: { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
        };
      default:
        return {};
    }
  };

  const getTapVariants = () => {
    switch (clickEffect) {
      case 'scale':
        return { scale: 0.95 };
      case 'pulse':
        return { scale: 1.05 };
      default:
        return {};
    }
  };

  return (
    <motion.div
      variants={getHoverVariants()}
      initial="rest"
      whileHover="hover"
      whileTap={getTapVariants()}
      className={`cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedButton Component
 * Button with built-in animations
 */
export function AnimatedButton({
  children,
  className = '',
  variant = 'primary',
  loading = false,
  disabled = false,
  onClick,
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  return (
    <motion.button
      variants={animationVariants.hoverScale}
      initial="rest"
      whileHover={disabled ? undefined : "hover"}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      className={`
        px-4 py-2 rounded-lg font-medium transition-colors
        ${getVariantClasses()}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <motion.div
          variants={animationVariants.spinner}
          animate="animate"
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
        />
      )}
      {children}
    </motion.button>
  );
}

/**
 * DeviceStatusIndicator Component
 * Animated status indicator for IoT devices
 */
export function DeviceStatusIndicator({
  status,
  size = 'md',
  showLabel = true,
  className = ''
}: {
  status: 'online' | 'offline' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      default:
        return 'w-3 h-3';
    }
  };

  const getStatusClasses = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'warning':
        return 'Warning';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.div
        animate={
          status === 'online' ? {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
            transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
          } : status === 'offline' ? {
            opacity: [1, 0.5, 1],
            transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
          } : status === 'warning' ? {
            y: [0, -2, 0],
            transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
          } : {
            x: [0, -2, 2, -2, 2, 0],
            transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
          }
        }
        className={`
          rounded-full
          ${getSizeClasses()}
          ${getStatusClasses()}
        `}
      />
      {showLabel && (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {getStatusLabel()}
        </span>
      )}
    </div>
  );
}

/**
 * CountingNumber Component
 * Animated number counter
 */
export function CountingNumber({
  value,
  duration = 2,
  className = '',
  prefix = '',
  suffix = ''
}: {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const countRef = useRef(null);
  const isInView = useInView(countRef, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / (duration * 1000), 1);
        const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
        
        setDisplayValue(currentValue);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    }
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={countRef}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{displayValue}{suffix}
    </motion.span>
  );
}

/**
 * ProgressBar Component
 * Animated progress bar
 */
export function ProgressBar({
  value,
  max = 100,
  className = '',
  showPercentage = true,
  color = 'blue',
  animated = true
}: {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animated?: boolean;
}) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${getColorClasses()}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

/**
 * PulseLoader Component
 * Animated loading indicator
 */
export function PulseLoader({
  size = 'md',
  color = 'blue',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500';
      case 'yellow':
        return 'bg-yellow-500';
      case 'red':
        return 'bg-red-500';
      case 'gray':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`rounded-full ${getSizeClasses()} ${getColorClasses()}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}

/**
 * FloatingAction Component
 * Animated floating action button
 */
export function FloatingAction({
  children,
  position = 'bottom-right',
  className = '',
  onClick,
  ...props
}: {
  children: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  className?: string;
  onClick?: () => void;
}) {
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <motion.button
      variants={animationVariants.hoverScale}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.9 }}
      className={`
        fixed z-50 w-14 h-14 rounded-full
        bg-blue-600 hover:bg-blue-700 text-white
        shadow-lg hover:shadow-xl
        flex items-center justify-center
        ${getPositionClasses()}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

/**
 * AnimatedList Component
 * List with staggered item animations
 */
export function AnimatedList({
  items,
  renderItem,
  className = '',
  itemClassName = '',
  staggerDelay = 0.1
}: {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={animationVariants.staggerItem}
          className={itemClassName}
        >
          {renderItem(item, index)}
        </motion.div>
      ))}
    </motion.div>
  );
}

export default {
  FadeInOnScroll,
  AnimatedCard,
  AnimatedButton,
  DeviceStatusIndicator,
  CountingNumber,
  ProgressBar,
  PulseLoader,
  FloatingAction,
  AnimatedList
};
