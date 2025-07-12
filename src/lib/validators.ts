// Validation utilities for Task 6: Components and Reusables
import { AutomationRule, Device, PricingPlan, Notification } from '../types/shared-components';

/**
 * Validate automation rule structure and logic
 */
export const validateRule = (rule: AutomationRule): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check basic structure
  if (!rule.name || rule.name.trim().length === 0) {
    errors.push('Rule name is required');
  }

  if (!rule.triggers || rule.triggers.length === 0) {
    errors.push('At least one trigger is required');
  }

  if (!rule.actions || rule.actions.length === 0) {
    errors.push('At least one action is required');
  }

  // Validate triggers
  rule.triggers?.forEach((trigger, index) => {
    if (!trigger.id || !trigger.type) {
      errors.push(`Trigger ${index + 1} is missing required fields`);
    }
    
    if (!trigger.config || Object.keys(trigger.config).length === 0) {
      errors.push(`Trigger ${index + 1} has invalid configuration`);
    }
  });

  // Validate conditions
  rule.conditions?.forEach((condition, index) => {
    if (!condition.id || !condition.type || !condition.operator) {
      errors.push(`Condition ${index + 1} is missing required fields`);
    }
    
    if (condition.value === null || condition.value === undefined) {
      errors.push(`Condition ${index + 1} has no value specified`);
    }
  });

  // Validate actions
  rule.actions?.forEach((action, index) => {
    if (!action.id || !action.type || !action.target) {
      errors.push(`Action ${index + 1} is missing required fields`);
    }
    
    if (!action.config || Object.keys(action.config).length === 0) {
      errors.push(`Action ${index + 1} has invalid configuration`);
    }
  });

  // Check for circular dependencies
  const triggerIds = new Set(rule.triggers?.map(t => t.id) || []);
  const actionTargets = new Set(rule.actions?.map(a => a.target) || []);
  
  const circularDeps = [...triggerIds].filter(id => actionTargets.has(id));
  if (circularDeps.length > 0) {
    errors.push('Circular dependency detected between triggers and actions');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate device configuration
 */
export const validateDeviceConfig = (
  device: Partial<Device>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!device.id || device.id.trim().length === 0) {
    errors.push('Device ID is required');
  }

  if (!device.name || device.name.trim().length === 0) {
    errors.push('Device name is required');
  }

  if (!device.type) {
    errors.push('Device type is required');
  }

  if (!device.status) {
    errors.push('Device status is required');
  }

  // Validate device type
  const validTypes = ['light', 'thermostat', 'security', 'sensor', 'appliance', 'industrial'];
  if (device.type && !validTypes.includes(device.type)) {
    errors.push(`Invalid device type: ${device.type}`);
  }

  // Validate device status
  const validStatuses = ['online', 'offline', 'warning', 'error'];
  if (device.status && !validStatuses.includes(device.status)) {
    errors.push(`Invalid device status: ${device.status}`);
  }

  // Validate signal strength
  if (device.signalStrength !== undefined) {
    if (device.signalStrength < 0 || device.signalStrength > 1) {
      errors.push('Signal strength must be between 0 and 1');
    }
  }

  // Validate battery level
  if (device.batteryLevel !== undefined) {
    if (device.batteryLevel < 0 || device.batteryLevel > 1) {
      errors.push('Battery level must be between 0 and 1');
    }
  }

  // Validate last seen date
  if (device.lastSeen && !(device.lastSeen instanceof Date)) {
    errors.push('Last seen must be a valid Date object');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate pricing plan configuration
 */
export const validatePricingPlan = (
  plan: Partial<PricingPlan>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!plan.id || plan.id.trim().length === 0) {
    errors.push('Plan ID is required');
  }

  if (!plan.name || plan.name.trim().length === 0) {
    errors.push('Plan name is required');
  }

  if (!plan.price) {
    errors.push('Price information is required');
  }

  if (!plan.ctaText || plan.ctaText.trim().length === 0) {
    errors.push('Call-to-action text is required');
  }

  // Validate pricing
  if (plan.price) {
    if (typeof plan.price.monthly !== 'number' || plan.price.monthly < 0) {
      errors.push('Monthly price must be a non-negative number');
    }

    if (typeof plan.price.yearly !== 'number' || plan.price.yearly < 0) {
      errors.push('Yearly price must be a non-negative number');
    }

    // Check yearly discount logic
    if (plan.price.yearly >= plan.price.monthly * 12) {
      errors.push('Yearly price should be less than monthly price * 12');
    }
  }

  // Validate features
  if (plan.features && plan.features.length > 0) {
    plan.features.forEach((feature, index) => {
      if (!feature.name || feature.name.trim().length === 0) {
        errors.push(`Feature ${index + 1} name is required`);
      }

      if (typeof feature.isIncluded !== 'boolean') {
        errors.push(`Feature ${index + 1} must specify if it's included`);
      }

      if (feature.limit !== undefined && feature.limit !== 'unlimited') {
        if (typeof feature.limit !== 'number' || feature.limit < 0) {
          errors.push(`Feature ${index + 1} limit must be a non-negative number or 'unlimited'`);
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate notification structure
 */
export const validateNotification = (
  notification: Partial<Notification>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  if (!notification.id || notification.id.trim().length === 0) {
    errors.push('Notification ID is required');
  }

  if (!notification.title || notification.title.trim().length === 0) {
    errors.push('Notification title is required');
  }

  if (!notification.message || notification.message.trim().length === 0) {
    errors.push('Notification message is required');
  }

  if (!notification.type) {
    errors.push('Notification type is required');
  }

  if (!notification.priority) {
    errors.push('Notification priority is required');
  }

  // Validate type
  const validTypes = ['info', 'warning', 'error', 'success'];
  if (notification.type && !validTypes.includes(notification.type)) {
    errors.push(`Invalid notification type: ${notification.type}`);
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (notification.priority && !validPriorities.includes(notification.priority)) {
    errors.push(`Invalid notification priority: ${notification.priority}`);
  }

  // Validate timestamp
  if (notification.timestamp && !(notification.timestamp instanceof Date)) {
    errors.push('Timestamp must be a valid Date object');
  }

  // Validate boolean fields
  if (notification.isRead !== undefined && typeof notification.isRead !== 'boolean') {
    errors.push('isRead must be a boolean value');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate chart data points
 */
export const validateChartData = (
  data: any[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Chart data must be an array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Chart data cannot be empty');
    return { isValid: false, errors };
  }

  data.forEach((point, index) => {
    if (!point.label || point.label.trim().length === 0) {
      errors.push(`Data point ${index + 1} is missing label`);
    }

    if (typeof point.value !== 'number') {
      errors.push(`Data point ${index + 1} value must be a number`);
    }

    if (point.timestamp && !(point.timestamp instanceof Date)) {
      errors.push(`Data point ${index + 1} timestamp must be a valid Date object`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate form input based on type
 */
export const validateInput = (
  value: string,
  type: string,
  required: boolean = false
): { isValid: boolean; error?: string } => {
  if (required && (!value || value.trim().length === 0)) {
    return { isValid: false, error: 'This field is required' };
  }

  if (!value || value.trim().length === 0) {
    return { isValid: true };
  }

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { isValid: false, error: 'Invalid email format' };
      }
      break;

    case 'phone':
      const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
      if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
        return { isValid: false, error: 'Invalid phone number format' };
      }
      break;

    case 'url':
      try {
        new URL(value);
      } catch {
        return { isValid: false, error: 'Invalid URL format' };
      }
      break;

    case 'number':
      if (isNaN(Number(value))) {
        return { isValid: false, error: 'Must be a valid number' };
      }
      break;

    case 'password':
      if (value.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters' };
      }
      break;

    default:
      // No specific validation for other types
      break;
  }

  return { isValid: true };
};

/**
 * Validate accessibility requirements
 */
export const validateAccessibility = (
  element: HTMLElement
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for alt text on images
  const images = element.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      warnings.push(`Image ${index + 1} is missing alt text`);
    }
  });

  // Check for proper heading hierarchy
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let prevLevel = 0;
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    if (level > prevLevel + 1) {
      warnings.push(`Heading ${index + 1} skips levels (h${prevLevel} to h${level})`);
    }
    prevLevel = level;
  });

  // Check for form labels
  const inputs = element.querySelectorAll('input, select, textarea');
  inputs.forEach((input, index) => {
    const hasLabel = input.hasAttribute('aria-label') || 
                    input.hasAttribute('aria-labelledby') ||
                    element.querySelector(`label[for="${input.id}"]`);
    
    if (!hasLabel) {
      warnings.push(`Form input ${index + 1} is missing proper label`);
    }
  });

  // Check for button accessibility
  const buttons = element.querySelectorAll('button, [role="button"]');
  buttons.forEach((button, index) => {
    if (!button.textContent?.trim() && !button.hasAttribute('aria-label')) {
      warnings.push(`Button ${index + 1} has no accessible text`);
    }
  });

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validate component performance
 */
export const validatePerformance = (
  renderTime: number,
  componentName: string
): { isValid: boolean; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Performance thresholds (in milliseconds)
  const RENDER_TIME_WARNING = 16; // 60fps = 16ms per frame
  const RENDER_TIME_ERROR = 33; // 30fps = 33ms per frame

  if (renderTime > RENDER_TIME_ERROR) {
    warnings.push(`${componentName} render time (${renderTime}ms) exceeds performance threshold`);
  } else if (renderTime > RENDER_TIME_WARNING) {
    warnings.push(`${componentName} render time (${renderTime}ms) is approaching performance threshold`);
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validate color contrast for accessibility
 */
export const validateColorContrast = (
  foreground: string,
  background: string
): { isValid: boolean; ratio: number; level: string } => {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (r: number, g: number, b: number) => {
    const sRGB = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);

  if (!fgRgb || !bgRgb) {
    return { isValid: false, ratio: 0, level: 'invalid' };
  }

  const fgLuminance = getLuminance(fgRgb.r, fgRgb.g, fgRgb.b);
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);

  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);

  let level = 'fail';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= 4.5) {
    level = 'AA';
  } else if (ratio >= 3) {
    level = 'AA Large';
  }

  return {
    isValid: ratio >= 4.5,
    ratio: Math.round(ratio * 100) / 100,
    level
  };
};
