import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EnergyGauge from '../EnergyGauge';

// Mock requestAnimationFrame
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

describe('EnergyGauge Component', () => {
  const defaultProps = {
    currentValue: 50,
    maxValue: 100,
    unit: 'kWh',
  };

  describe('Basic Rendering', () => {
    it('renders energy gauge with default props', () => {
      render(<EnergyGauge {...defaultProps} />);
      
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('kWh')).toBeInTheDocument();
    });

    it('renders with custom label', () => {
      render(<EnergyGauge {...defaultProps} label="Energy Consumption" />);
      
      expect(screen.getByText('Energy Consumption')).toBeInTheDocument();
    });

    it('renders with percentage format', () => {
      render(<EnergyGauge {...defaultProps} format="percentage" animated={false} />);
      
      // Check the main value display
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('50%');
    });

    it('shows percentage indicator when enabled', () => {
      render(<EnergyGauge {...defaultProps} showPercentage />);
      
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('renders with different sizes', () => {
      const { rerender } = render(<EnergyGauge {...defaultProps} size="small" />);
      let svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      
      rerender(<EnergyGauge {...defaultProps} size="medium" />);
      svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '180');
      
      rerender(<EnergyGauge {...defaultProps} size="large" />);
      svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '240');
    });
  });

  describe('Color Schemes', () => {
    it('applies default color scheme', () => {
      render(<EnergyGauge {...defaultProps} colorScheme="default" animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-yellow-500');
    });

    it('applies energy color scheme', () => {
      render(<EnergyGauge {...defaultProps} colorScheme="energy" animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-yellow-500');
    });

    it('applies performance color scheme', () => {
      render(<EnergyGauge {...defaultProps} colorScheme="performance" animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-purple-500');
    });
  });

  describe('Threshold Colors', () => {
    it('shows green for low values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={20} animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-green-500');
    });

    it('shows yellow for medium values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={50} animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-yellow-500');
    });

    it('shows red for high values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={95} animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-red-500');
    });

    it('respects custom thresholds', () => {
      const customThresholds = { low: 25, medium: 50, high: 75 };
      render(
        <EnergyGauge
          {...defaultProps}
          currentValue={30}
          thresholds={customThresholds}
          animated={false}
        />
      );
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-yellow-500');
    });
  });

  describe('Needle Display', () => {
    it('shows needle by default', () => {
      render(<EnergyGauge {...defaultProps} />);
      
      const needle = document.querySelector('line[stroke-width="3"]');
      expect(needle).toBeInTheDocument();
    });

    it('hides needle when disabled', () => {
      render(<EnergyGauge {...defaultProps} showNeedle={false} />);
      
      const needle = document.querySelector('line[stroke-width="3"]');
      expect(needle).not.toBeInTheDocument();
    });

    it('positions needle correctly for different values', () => {
      const { rerender } = render(<EnergyGauge {...defaultProps} currentValue={0} />);
      
      let needleGroup = document.querySelector('g[transform*="rotate"]');
      expect(needleGroup).toHaveAttribute('transform', expect.stringContaining('rotate(-90'));
      
      rerender(<EnergyGauge {...defaultProps} currentValue={50} />);
      needleGroup = document.querySelector('g[transform*="rotate"]');
      expect(needleGroup).toHaveAttribute('transform', expect.stringContaining('rotate(0'));
      
      rerender(<EnergyGauge {...defaultProps} currentValue={100} />);
      needleGroup = document.querySelector('g[transform*="rotate"]');
      expect(needleGroup).toHaveAttribute('transform', expect.stringContaining('rotate(90'));
    });
  });

  describe('Labels and Markers', () => {
    it('shows labels by default', () => {
      render(<EnergyGauge {...defaultProps} animated={false} />);
      
      const scaleLabels = document.querySelectorAll('.max-w-xs span');
      expect(scaleLabels[0]).toHaveTextContent('0');
      expect(scaleLabels[1]).toHaveTextContent('50');
      expect(scaleLabels[2]).toHaveTextContent('100');
    });

    it('hides labels when disabled', () => {
      render(<EnergyGauge {...defaultProps} showLabels={false} animated={false} />);
      
      // Should not have the scale labels section
      const scaleLabels = document.querySelector('.max-w-xs');
      expect(scaleLabels).not.toBeInTheDocument();
    });

    it('shows threshold markers', () => {
      render(<EnergyGauge {...defaultProps} animated={false} />);
      
      const thresholdLines = document.querySelectorAll('line[stroke="#6b7280"]');
      expect(thresholdLines).toHaveLength(3); // low, medium, high
    });

    it('shows legend', () => {
      render(<EnergyGauge {...defaultProps} animated={false} />);
      
      expect(screen.getByText('Low')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('enables animation by default', () => {
      render(<EnergyGauge {...defaultProps} animated />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveStyle('transition: stroke-dashoffset 0.5s ease-out');
    });

    it('disables animation when specified', () => {
      render(<EnergyGauge {...defaultProps} animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveStyle('transition: none');
    });

    it('animates value changes', async () => {
      const { rerender } = render(<EnergyGauge {...defaultProps} currentValue={0} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('0');
      
      rerender(<EnergyGauge {...defaultProps} currentValue={75} />);
      
      // Wait for animation to complete
      await waitFor(() => {
        const updatedValueElement = document.querySelector('.font-bold.text-gray-900');
        expect(updatedValueElement).toHaveTextContent('75');
      }, { timeout: 2000 });
    });
  });

  describe('Value Formatting', () => {
    it('formats large numbers with commas', () => {
      render(<EnergyGauge {...defaultProps} currentValue={1500} maxValue={2000} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('1,500');
    });

    it('rounds decimal values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={42.7} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('43');
    });

    it('handles percentage format correctly', () => {
      render(<EnergyGauge {...defaultProps} currentValue={75} format="percentage" animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('75%');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={0} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('0');
    });

    it('handles values exceeding maximum', () => {
      render(<EnergyGauge {...defaultProps} currentValue={150} maxValue={100} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('150');
      // Should cap at 100% progress
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveAttribute('stroke-dashoffset', expect.stringContaining('131.94'));
    });

    it('handles negative values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={-10} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      expect(valueElement).toHaveTextContent('-10');
    });

    it('handles very large values', () => {
      render(<EnergyGauge {...defaultProps} currentValue={1000000} maxValue={2000000} animated={false} />);
      
      const valueElement = document.querySelector('.font-bold.text-gray-900');
      // Should contain the number (formatting may vary by locale - could be 1,000,000 or 10,00,000)
      expect(valueElement?.textContent).toMatch(/1[0,\s]*0{3,}/);
    });
  });

  describe('Accessibility', () => {
    it('has proper SVG structure', () => {
      render(<EnergyGauge {...defaultProps} />);
      
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute('viewBox');
    });

    it('uses semantic colors', () => {
      render(<EnergyGauge {...defaultProps} currentValue={95} animated={false} />);
      
      const progressCircle = document.querySelectorAll('circle')[1];
      expect(progressCircle).toHaveClass('stroke-red-500');
    });

    it('provides value information', () => {
      render(<EnergyGauge {...defaultProps} />);
      
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('kWh')).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className', () => {
      render(<EnergyGauge {...defaultProps} className="custom-gauge" />);
      
      const container = document.querySelector('.custom-gauge');
      expect(container).toBeInTheDocument();
    });

    it('maintains responsive design', () => {
      render(<EnergyGauge {...defaultProps} size="small" />);
      
      const svg = document.querySelector('svg');
      expect(svg).toHaveAttribute('width', '120');
      expect(svg).toHaveAttribute('height', '120');
    });
  });

  describe('Performance', () => {
    it('handles rapid value changes', async () => {
      const { rerender } = render(<EnergyGauge {...defaultProps} currentValue={10} />);
      
      // Rapidly change values
      for (let i = 10; i <= 90; i += 10) {
        rerender(<EnergyGauge {...defaultProps} currentValue={i} />);
      }
      
      // Should eventually settle on final value
      await waitFor(() => {
        expect(screen.getByText('90')).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('cleans up animations on unmount', () => {
      const { unmount } = render(<EnergyGauge {...defaultProps} />);
      
      // Should not throw error on unmount
      expect(() => unmount()).not.toThrow();
    });
  });
});
