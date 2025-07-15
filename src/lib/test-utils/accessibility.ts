/**
 * Accessibility testing utilities for comprehensive a11y validation
 */
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, RenderResult } from '@testing-library/react';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

export interface AccessibilityTestOptions {
  rules?: any;
}

/**
 * Run accessibility tests on a rendered component
 */
export async function testAccessibility(
  container: Element,
  options: AccessibilityTestOptions = {}
) {
  const results = await axe(container, {
    rules: options.rules
  });

  expect(results).toHaveNoViolations();
  return results;
}

/**
 * Test component for keyboard navigation
 */
export function testKeyboardNavigation(element: Element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  return {
    focusableCount: focusableElements.length,
    focusableElements: Array.from(focusableElements),
    hasFocusableElements: focusableElements.length > 0
  };
}

/**
 * Test ARIA attributes on an element
 */
export function testAriaAttributes(element: Element) {
  const ariaAttributes = Array.from(element.attributes)
    .filter(attr => attr.name.startsWith('aria-'))
    .reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {} as Record<string, string>);

  return {
    hasAriaLabel: element.hasAttribute('aria-label'),
    hasAriaLabelledBy: element.hasAttribute('aria-labelledby'),
    hasAriaDescribedBy: element.hasAttribute('aria-describedby'),
    hasRole: element.hasAttribute('role'),
    ariaAttributes
  };
}

/**
 * Test color contrast (basic implementation)
 */
export function testColorContrast(element: Element) {
  const styles = window.getComputedStyle(element);
  const color = styles.color;
  const backgroundColor = styles.backgroundColor;

  return {
    color,
    backgroundColor,
    hasColorSet: color !== '',
    hasBackgroundColorSet: backgroundColor !== ''
  };
}

/**
 * Accessibility testing preset for shared components
 */
export const SHARED_COMPONENT_A11Y_CONFIG = {
  rules: {
    // Custom rules for IoT components
    'color-contrast': { enabled: true },
    'focus-order-semantics': { enabled: true },
    'aria-required-attr': { enabled: true },
    'aria-valid-attr': { enabled: true },
    'button-name': { enabled: true },
    'link-name': { enabled: true },
    'heading-order': { enabled: true },
    'landmark-no-duplicate-banner': { enabled: true },
    'landmark-no-duplicate-contentinfo': { enabled: true },
    'region': { enabled: true }
  }
};

/**
 * Performance testing utility for accessibility checks
 */
export function measureA11yPerformance<T>(testFn: () => T): { result: T; duration: number } {
  const start = performance.now();
  const result = testFn();
  const end = performance.now();
  
  return {
    result,
    duration: end - start
  };
}

/**
 * Component accessibility validation
 */
export interface ComponentA11yReport {
  component: string;
  violations: number;
  passes: number;
  focusableElements: number;
  ariaAttributes: number;
  keyboardNavigable: boolean;
  colorContrastIssues: boolean;
  testDuration: number;
}

export async function generateA11yReport(
  renderResult: RenderResult,
  componentName: string
): Promise<ComponentA11yReport> {
  const { container } = renderResult;
  
  const axeResults = await axe(container, SHARED_COMPONENT_A11Y_CONFIG);
  const keyboardNav = testKeyboardNavigation(container);
  const ariaTest = testAriaAttributes(container);
  
  return {
    component: componentName,
    violations: axeResults.violations.length,
    passes: axeResults.passes.length,
    focusableElements: keyboardNav.focusableCount,
    ariaAttributes: Object.keys(ariaTest.ariaAttributes).length,
    keyboardNavigable: keyboardNav.hasFocusableElements,
    colorContrastIssues: axeResults.violations.some((v: any) => v.id === 'color-contrast'),
    testDuration: 0
  };
}
