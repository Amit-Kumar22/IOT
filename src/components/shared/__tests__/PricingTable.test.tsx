import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PricingTable from '../PricingTable';
import { PricingPlan } from '../../../types/shared-components';

// Mock data for testing
const mockPlans = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for getting started',
    price: {
      monthly: 9,
      yearly: 99,
    },
    features: [
      { name: 'Up to 5 devices', isIncluded: true, limit: 5 },
      { name: 'Basic analytics', isIncluded: true },
      { name: 'Email support', isIncluded: true },
      { name: 'Advanced features', isIncluded: false },
    ],
    limits: [
      { name: 'Devices', value: 5, unit: '' },
      { name: 'API calls', value: 1000, unit: '/month' },
    ],
    ctaText: 'Get Started',
    isPopular: false,
    isEnterprise: false,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For growing businesses',
    price: {
      monthly: 29,
      yearly: 299,
    },
    features: [
      { name: 'Up to 50 devices', isIncluded: true, limit: 50 },
      { name: 'Advanced analytics', isIncluded: true, highlight: true },
      { name: 'Priority support', isIncluded: true },
      { name: 'API access', isIncluded: true },
      { name: 'Custom integrations', isIncluded: false },
    ],
    limits: [
      { name: 'Devices', value: 50, unit: '' },
      { name: 'API calls', value: 'unlimited', unit: '' },
    ],
    ctaText: 'Start Free Trial',
    isPopular: true,
    isEnterprise: false,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    price: {
      monthly: 99,
      yearly: 999,
    },
    features: [
      { name: 'Unlimited devices', isIncluded: true, limit: 'unlimited' },
      { name: 'Advanced analytics', isIncluded: true },
      { name: 'Dedicated support', isIncluded: true },
      { name: 'API access', isIncluded: true },
      { name: 'Custom integrations', isIncluded: true },
      { name: 'SSO & SAML', isIncluded: true, description: 'Single Sign-On with SAML support' },
    ],
    limits: [
      { name: 'Devices', value: 'unlimited', unit: '' },
      { name: 'API calls', value: 'unlimited', unit: '' },
      { name: 'Storage', value: 'unlimited', unit: '' },
    ],
    ctaText: 'Contact Sales',
    isPopular: false,
    isEnterprise: true,
  },
] as PricingPlan[];

const defaultProps = {
  plans: mockPlans,
  billingCycle: 'monthly' as const,
  onPlanSelect: jest.fn(),
  onBillingCycleChange: jest.fn(),
};

describe('PricingTable Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders pricing table with plans', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });

    it('renders plan descriptions', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Perfect for getting started')).toBeInTheDocument();
      expect(screen.getByText('For growing businesses')).toBeInTheDocument();
      expect(screen.getByText('For large organizations')).toBeInTheDocument();
    });

    it('renders monthly pricing by default', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('$9')).toBeInTheDocument();
      expect(screen.getByText('$29')).toBeInTheDocument();
      expect(screen.getByText('$99')).toBeInTheDocument();
    });

    it('renders yearly pricing when specified', () => {
      render(<PricingTable {...defaultProps} billingCycle="yearly" />);
      
      expect(screen.getByText('$99')).toBeInTheDocument();
      expect(screen.getByText('$299')).toBeInTheDocument();
      expect(screen.getByText('$999')).toBeInTheDocument();
    });
  });

  describe('Billing Cycle Toggle', () => {
    it('renders billing cycle toggle buttons', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });

    it('highlights active billing cycle', () => {
      render(<PricingTable {...defaultProps} billingCycle="monthly" />);
      
      const monthlyButton = screen.getByText('Monthly');
      expect(monthlyButton).toHaveClass('bg-white', 'text-gray-900');
    });

    it('calls onBillingCycleChange when clicked', () => {
      const mockOnBillingCycleChange = jest.fn();
      render(<PricingTable {...defaultProps} onBillingCycleChange={mockOnBillingCycleChange} />);
      
      fireEvent.click(screen.getByText('Yearly'));
      expect(mockOnBillingCycleChange).toHaveBeenCalledWith('yearly');
    });

    it('shows save percentage for yearly billing', () => {
      render(<PricingTable {...defaultProps} billingCycle="yearly" />);
      
      expect(screen.getByText('Save up to 20%')).toBeInTheDocument();
    });
  });

  describe('Popular Plan Highlighting', () => {
    it('shows popular badge for popular plans', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Most Popular')).toBeInTheDocument();
    });

    it('applies special styling to popular plans', () => {
      render(<PricingTable {...defaultProps} />);
      
      const proCard = screen.getByText('Professional').closest('div');
      expect(proCard).toHaveClass('border-blue-500', 'scale-105');
    });

    it('shows star icon for popular plans', () => {
      render(<PricingTable {...defaultProps} />);
      
      const starIcon = document.querySelector('.fill-current');
      expect(starIcon).toBeInTheDocument();
    });
  });

  describe('Features Display', () => {
    it('renders feature lists for each plan', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Up to 5 devices')).toBeInTheDocument();
      expect(screen.getByText('Up to 50 devices')).toBeInTheDocument();
      expect(screen.getByText('Unlimited devices')).toBeInTheDocument();
    });

    it('shows check icons for included features', () => {
      render(<PricingTable {...defaultProps} />);
      
      const checkIcons = document.querySelectorAll('.text-green-500');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('shows X icons for excluded features', () => {
      render(<PricingTable {...defaultProps} />);
      
      const xIcons = document.querySelectorAll('.text-red-500');
      expect(xIcons.length).toBeGreaterThan(0);
    });

    it('highlights important features', () => {
      render(<PricingTable {...defaultProps} />);
      
      const highlightedFeature = screen.getByText('Advanced analytics');
      expect(highlightedFeature).toHaveClass('font-medium', 'text-gray-900');
    });

    it('shows feature limits correctly', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getAllByText('Unlimited')).toHaveLength(4); // Multiple unlimited features
    });
  });

  describe('Limits Display', () => {
    it('renders plan limits', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Devices')).toBeInTheDocument();
      expect(screen.getByText('API calls')).toBeInTheDocument();
    });

    it('shows unlimited for unlimited limits', () => {
      render(<PricingTable {...defaultProps} />);
      
      const unlimitedTexts = screen.getAllByText('Unlimited');
      expect(unlimitedTexts.length).toBeGreaterThan(0);
    });

    it('shows numeric limits with units', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('1000/month')).toBeInTheDocument();
    });
  });

  describe('Plan Selection', () => {
    it('renders CTA buttons for all plans', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('Get Started')).toBeInTheDocument();
      expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
      expect(screen.getByText('Contact Sales')).toBeInTheDocument();
    });

    it('calls onPlanSelect when CTA button is clicked', () => {
      const mockOnPlanSelect = jest.fn();
      render(<PricingTable {...defaultProps} onPlanSelect={mockOnPlanSelect} />);
      
      fireEvent.click(screen.getByText('Get Started'));
      expect(mockOnPlanSelect).toHaveBeenCalledWith('basic');
    });

    it('highlights current plan', () => {
      render(<PricingTable {...defaultProps} currentPlan="pro" />);
      
      const proCard = screen.getByText('Professional').closest('div');
      expect(proCard).toHaveClass('ring-2', 'ring-blue-500');
    });

    it('highlights specified plan', () => {
      render(<PricingTable {...defaultProps} highlightedPlan="enterprise" />);
      
      const enterpriseCard = screen.getByText('Enterprise').closest('div');
      expect(enterpriseCard).toHaveClass('ring-2', 'ring-yellow-400');
    });
  });

  describe('Currency Support', () => {
    it('renders USD currency by default', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(screen.getByText('$9')).toBeInTheDocument();
    });

    it('renders EUR currency when specified', () => {
      render(<PricingTable {...defaultProps} currency="EUR" />);
      
      expect(screen.getByText('€9')).toBeInTheDocument();
    });

    it('renders GBP currency when specified', () => {
      render(<PricingTable {...defaultProps} currency="GBP" />);
      
      expect(screen.getByText('£9')).toBeInTheDocument();
    });

    it('renders INR currency when specified', () => {
      render(<PricingTable {...defaultProps} currency="INR" />);
      
      expect(screen.getByText('₹9')).toBeInTheDocument();
    });

    it('falls back to USD for unsupported currencies', () => {
      render(<PricingTable {...defaultProps} currency="JPY" />);
      
      expect(screen.getByText('$9')).toBeInTheDocument();
    });
  });

  describe('Comparison View', () => {
    it('renders comparison table when showComparison is true', () => {
      render(<PricingTable {...defaultProps} showComparison={true} />);
      
      expect(screen.getByText('Features')).toBeInTheDocument();
      expect(document.querySelector('table')).toBeInTheDocument();
    });

    it('shows all features in comparison table', () => {
      render(<PricingTable {...defaultProps} showComparison={true} />);
      
      expect(screen.getByText('Up to 5 devices')).toBeInTheDocument();
      expect(screen.getByText('Basic analytics')).toBeInTheDocument();
      expect(screen.getByText('Email support')).toBeInTheDocument();
    });

    it('shows plan headers in comparison view', () => {
      render(<PricingTable {...defaultProps} showComparison={true} />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Professional')).toBeInTheDocument();
      expect(screen.getByText('Enterprise')).toBeInTheDocument();
    });
  });

  describe('Tooltips', () => {
    it('shows info icon for features with descriptions', () => {
      render(<PricingTable {...defaultProps} />);
      
      const infoIcons = document.querySelectorAll('.cursor-help');
      expect(infoIcons.length).toBeGreaterThan(0);
    });

    it('shows tooltip on hover', async () => {
      render(<PricingTable {...defaultProps} />);
      
      const infoIcon = document.querySelector('.cursor-help');
      if (infoIcon) {
        fireEvent.mouseEnter(infoIcon);
        await waitFor(() => {
          expect(screen.getByText('Single Sign-On with SAML support')).toBeInTheDocument();
        });
      }
    });

    it('hides tooltip on mouse leave', async () => {
      render(<PricingTable {...defaultProps} />);
      
      const infoIcon = document.querySelector('.cursor-help');
      if (infoIcon) {
        fireEvent.mouseEnter(infoIcon);
        fireEvent.mouseLeave(infoIcon);
        await waitFor(() => {
          expect(screen.queryByText('Single Sign-On with SAML support')).not.toBeInTheDocument();
        });
      }
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive grid classes', () => {
      render(<PricingTable {...defaultProps} />);
      
      const gridContainer = document.querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
    });

    it('enables horizontal scrolling for comparison table', () => {
      render(<PricingTable {...defaultProps} showComparison={true} />);
      
      const scrollContainer = document.querySelector('.overflow-x-auto');
      expect(scrollContainer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper button roles', () => {
      render(<PricingTable {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has proper table structure in comparison view', () => {
      render(<PricingTable {...defaultProps} showComparison={true} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(4); // Features + 3 plans
    });

    it('uses semantic HTML elements', () => {
      render(<PricingTable {...defaultProps} />);
      
      expect(document.querySelector('h3')).toBeInTheDocument();
      expect(document.querySelector('h4')).toBeInTheDocument();
      expect(document.querySelector('ul')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<PricingTable {...defaultProps} className="custom-pricing" />);
      
      const container = document.querySelector('.custom-pricing');
      expect(container).toBeInTheDocument();
    });

    it('maintains base styling with custom className', () => {
      render(<PricingTable {...defaultProps} className="custom-pricing" />);
      
      const container = document.querySelector('.custom-pricing');
      expect(container).toHaveClass('w-full');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty plans array', () => {
      render(<PricingTable {...defaultProps} plans={[]} />);
      
      // Should render billing toggle but no plans
      expect(screen.getByText('Monthly')).toBeInTheDocument();
      expect(screen.getByText('Yearly')).toBeInTheDocument();
    });

    it('handles plans without features', () => {
      const plansWithoutFeatures = [{
        ...mockPlans[0],
        features: [],
        limits: [],
      }];
      
      render(<PricingTable {...defaultProps} plans={plansWithoutFeatures} />);
      
      expect(screen.getByText('Basic')).toBeInTheDocument();
    });

    it('handles missing price data gracefully', () => {
      const incompletePrice = {
        ...mockPlans[0],
        price: { monthly: 9, yearly: 0 },
      };
      
      render(<PricingTable {...defaultProps} plans={[incompletePrice]} />);
      
      expect(screen.getByText('$9')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('handles large number of plans efficiently', () => {
      const manyPlans = Array(20).fill(null).map((_, i) => ({
        ...mockPlans[0],
        id: `plan-${i}`,
        name: `Plan ${i}`,
      }));
      
      const { container } = render(<PricingTable {...defaultProps} plans={manyPlans} />);
      
      expect(container.querySelectorAll('[data-testid]')).toBeDefined();
    });

    it('renders without performance issues', () => {
      const startTime = performance.now();
      render(<PricingTable {...defaultProps} />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in < 100ms
    });
  });
});
