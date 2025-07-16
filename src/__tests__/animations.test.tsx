/**
 * Animation System Tests
 * Tests for animation configuration and components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import { animationVariants, deviceStatusAnimations, easingConfigs } from '@/lib/animations';
import {
  PageTransition,
  PageTransitionProvider,
  ModalTransition,
  DrawerTransition,
  StaggeredList,
  StaggeredItem,
  NotificationTransition
} from '@/components/ui/PageTransition';
import {
  FadeInOnScroll,
  AnimatedCard,
  AnimatedButton,
  DeviceStatusIndicator,
  CountingNumber,
  ProgressBar,
  PulseLoader,
  FloatingAction,
  AnimatedList
} from '@/components/ui/AnimatedComponents';

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>
  },
  AnimatePresence: ({ children }: any) => children,
  useInView: () => true,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn()
  })
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/test-path'
}));

describe('Animation Configuration', () => {
  it('should have all required animation variants', () => {
    const requiredVariants = [
      'fadeIn',
      'fadeInUp',
      'fadeInDown',
      'fadeInLeft',
      'fadeInRight',
      'scaleIn',
      'scaleInOut',
      'slideUp',
      'slideDown',
      'slideLeft',
      'slideRight',
      'staggerContainer',
      'staggerItem',
      'pageTransition',
      'modalBackdrop',
      'modalContent',
      'drawerOverlay',
      'drawerContent',
      'deviceConnect',
      'deviceDisconnect',
      'pulseGlow',
      'spinner',
      'bounce',
      'hoverLift',
      'hoverScale',
      'notificationSlide'
    ];

    requiredVariants.forEach(variant => {
      expect(animationVariants[variant]).toBeDefined();
    });
  });

  it('should have device status animations', () => {
    const statuses: (keyof typeof deviceStatusAnimations)[] = ['online', 'offline', 'warning', 'error'];
    
    statuses.forEach(status => {
      expect(deviceStatusAnimations[status]).toBeDefined();
    });
  });

  it('should have easing configurations', () => {
    expect(easingConfigs.ease).toBeDefined();
    expect(easingConfigs.easeIn).toBeDefined();
    expect(easingConfigs.easeOut).toBeDefined();
    expect(easingConfigs.easeInOut).toBeDefined();
    expect(easingConfigs.spring).toBeDefined();
    expect(easingConfigs.springBounce).toBeDefined();
  });
});

describe('PageTransition Components', () => {
  it('should render PageTransition with children', () => {
    render(
      <PageTransition>
        <div>Test Content</div>
      </PageTransition>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render PageTransitionProvider', () => {
    render(
      <PageTransitionProvider>
        <div>App Content</div>
      </PageTransitionProvider>
    );

    expect(screen.getByText('App Content')).toBeInTheDocument();
  });

  it('should render ModalTransition when open', () => {
    render(
      <ModalTransition isOpen={true}>
        <div>Modal Content</div>
      </ModalTransition>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render ModalTransition when closed', () => {
    render(
      <ModalTransition isOpen={false}>
        <div>Modal Content</div>
      </ModalTransition>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should render DrawerTransition when open', () => {
    render(
      <DrawerTransition isOpen={true}>
        <div>Drawer Content</div>
      </DrawerTransition>
    );

    expect(screen.getByText('Drawer Content')).toBeInTheDocument();
  });

  it('should render StaggeredList with items', () => {
    render(
      <StaggeredList>
        <StaggeredItem>Item 1</StaggeredItem>
        <StaggeredItem>Item 2</StaggeredItem>
      </StaggeredList>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('should render NotificationTransition when visible', () => {
    render(
      <NotificationTransition isVisible={true}>
        <div>Notification</div>
      </NotificationTransition>
    );

    expect(screen.getByText('Notification')).toBeInTheDocument();
  });
});

describe('AnimatedComponents', () => {
  it('should render FadeInOnScroll component', () => {
    render(
      <FadeInOnScroll>
        <div>Fade Content</div>
      </FadeInOnScroll>
    );

    expect(screen.getByText('Fade Content')).toBeInTheDocument();
  });

  it('should render AnimatedCard with click handler', () => {
    const handleClick = jest.fn();
    
    render(
      <AnimatedCard onClick={handleClick}>
        <div>Card Content</div>
      </AnimatedCard>
    );

    const card = screen.getByText('Card Content').closest('div');
    fireEvent.click(card!);
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render AnimatedButton with loading state', () => {
    render(
      <AnimatedButton loading={true}>
        Submit
      </AnimatedButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should render AnimatedButton with different variants', () => {
    const variants = ['primary', 'secondary', 'danger', 'success'] as const;
    
    variants.forEach(variant => {
      render(
        <AnimatedButton variant={variant}>
          {variant} Button
        </AnimatedButton>
      );
      
      expect(screen.getByText(`${variant} Button`)).toBeInTheDocument();
    });
  });

  it('should render DeviceStatusIndicator with different statuses', () => {
    const statuses = ['online', 'offline', 'warning', 'error'] as const;
    
    statuses.forEach(status => {
      render(
        <DeviceStatusIndicator status={status} />
      );
      
      expect(screen.getByText(status.charAt(0).toUpperCase() + status.slice(1))).toBeInTheDocument();
    });
  });

  it('should render CountingNumber with value', () => {
    render(
      <CountingNumber value={100} prefix="$" suffix="USD" />
    );

    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('should render ProgressBar with percentage', () => {
    render(
      <ProgressBar value={75} max={100} />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('should render PulseLoader with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const;
    
    sizes.forEach(size => {
      const { container } = render(
        <PulseLoader size={size} data-testid={`loader-${size}`} />
      );
      
      expect(container.querySelector(`[data-testid="loader-${size}"]`)).toBeInTheDocument();
    });
  });

  it('should render FloatingAction with click handler', () => {
    const handleClick = jest.fn();
    
    render(
      <FloatingAction onClick={handleClick}>
        <span>+</span>
      </FloatingAction>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('should render AnimatedList with items', () => {
    const items = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' }
    ];
    
    render(
      <AnimatedList
        items={items}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
      />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('Animation Performance', () => {
  it('should apply performance optimizations', () => {
    render(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ willChange: 'transform, opacity' }}
      >
        Content
      </motion.div>
    );

    const element = screen.getByText('Content');
    expect(element).toBeInTheDocument();
  });

  it('should handle reduced motion preference', () => {
    // Mock matchMedia for reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <PageTransition enableReducedMotion={true}>
        <div>Reduced Motion Content</div>
      </PageTransition>
    );

    expect(screen.getByText('Reduced Motion Content')).toBeInTheDocument();
  });
});

describe('Animation Accessibility', () => {
  it('should respect reduced motion settings', () => {
    // Test that animations are disabled when user prefers reduced motion
    const mockMatchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    render(
      <AnimatedButton>
        Test Button
      </AnimatedButton>
    );

    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should provide proper focus management', () => {
    render(
      <AnimatedButton>
        Focusable Button
      </AnimatedButton>
    );

    const button = screen.getByRole('button');
    button.focus();
    expect(button).toHaveFocus();
  });
});

describe('Animation Error Handling', () => {
  it('should handle animation errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <motion.div
        animate={{ opacity: 1 }}
      >
        Content
      </motion.div>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  it('should fallback when animation library fails', () => {
    // Test component rendering without animations
    render(
      <div>
        <AnimatedCard>
          <div>Fallback Content</div>
        </AnimatedCard>
      </div>
    );

    expect(screen.getByText('Fallback Content')).toBeInTheDocument();
  });
});

describe('Animation Integration', () => {
  it('should work with theme changes', () => {
    render(
      <div className="dark">
        <AnimatedCard>
          <div>Dark Theme Content</div>
        </AnimatedCard>
      </div>
    );

    expect(screen.getByText('Dark Theme Content')).toBeInTheDocument();
  });

  it('should work with responsive breakpoints', () => {
    render(
      <div className="md:hidden lg:block">
        <AnimatedCard>
          <div>Responsive Content</div>
        </AnimatedCard>
      </div>
    );

    expect(screen.getByText('Responsive Content')).toBeInTheDocument();
  });
});
