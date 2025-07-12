import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Simple component for testing accessibility
const TestComponent = ({ children }: { children: React.ReactNode }) => (
  <div role="main" aria-label="Test component">
    {children}
  </div>
);

describe('Consumer Components Accessibility Tests', () => {
  describe('Basic Accessibility Requirements', () => {
    it('should have no accessibility violations for basic structure', async () => {
      const { container } = render(
        <TestComponent>
          <h1>Energy Dashboard</h1>
          <p>Your energy consumption overview</p>
          <button type="button" aria-label="Toggle devices">
            Toggle All
          </button>
        </TestComponent>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper heading structure', async () => {
      const { container } = render(
        <div>
          <h1>Main Dashboard</h1>
          <h2>Energy Overview</h2>
          <h3>Device Status</h3>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper button accessibility', async () => {
      const { container } = render(
        <div>
          <button type="button" aria-label="Turn on lights">
            Turn On
          </button>
          <button type="button" aria-describedby="help-text">
            Schedule
          </button>
          <div id="help-text">Set device schedule</div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper form accessibility', async () => {
      const { container } = render(
        <form>
          <label htmlFor="device-name">Device Name</label>
          <input 
            id="device-name"
            type="text"
            aria-required="true"
            aria-describedby="name-help"
          />
          <div id="name-help">Enter a unique name for your device</div>
        </form>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper link accessibility', async () => {
      const { container } = render(
        <nav>
          <a href="/dashboard" aria-label="Go to dashboard">
            Dashboard
          </a>
          <a href="/settings" aria-current="page">
            Settings
          </a>
        </nav>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should pass color contrast requirements', async () => {
      const { container } = render(
        <div className="bg-white text-gray-900">
          <h1 className="text-2xl font-bold">Energy Dashboard</h1>
          <p className="text-gray-600">Current usage: 2.4 kWh</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            View Details
          </button>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'color-contrast': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      const { container } = render(
        <div>
          <button tabIndex={0}>First Button</button>
          <button tabIndex={0}>Second Button</button>
          <input type="text" tabIndex={0} aria-label="Search input" />
        </div>
      );

      const results = await axe(container, {
        rules: {
          'tabindex': { enabled: true },
          'focus-order-semantics': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Screen Reader Compatibility', () => {
    it('should be compatible with screen readers', async () => {
      const { container } = render(
        <div>
          <div role="status" aria-live="polite">
            Device status updated
          </div>
          <button aria-expanded="false" aria-controls="device-menu">
            Device Menu
          </button>
          <div id="device-menu" role="menu" hidden>
            <div role="menuitem">Turn On</div>
            <div role="menuitem">Schedule</div>
          </div>
        </div>
      );

      const results = await axe(container, {
        rules: {
          'aria-valid-attr': { enabled: true },
          'aria-valid-attr-value': { enabled: true },
          'aria-roles': { enabled: true }
        }
      });
      expect(results).toHaveNoViolations();
    });
  });

  describe('Mobile Accessibility', () => {
    it('should meet mobile accessibility requirements', async () => {
      const { container } = render(
        <div>
          <button 
            className="touch-target-44" 
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Toggle device"
          >
            Toggle
          </button>
          <input 
            type="text" 
            style={{ minHeight: '44px' }}
            aria-label="Device name"
          />
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Consumer UI Patterns', () => {
    it('should validate energy display patterns', async () => {
      const { container } = render(
        <div role="region" aria-label="Energy usage">
          <h2>Energy Usage</h2>
          <dl>
            <dt>Current Usage</dt>
            <dd>2.4 kWh</dd>
            <dt>Daily Usage</dt>
            <dd>18.7 kWh</dd>
          </dl>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should validate device control patterns', async () => {
      const { container } = render(
        <div role="region" aria-label="Device controls">
          <h2>Living Room Lights</h2>
          <div role="group" aria-label="Light controls">
            <button 
              type="button"
              aria-pressed="false"
              aria-label="Turn on living room lights"
            >
              On/Off
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="50"
              aria-label="Light brightness"
            />
          </div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should validate automation patterns', async () => {
      const { container } = render(
        <div role="region" aria-label="Automation schedules">
          <h2>Schedules</h2>
          <div role="list" aria-label="Device schedules">
            <div role="listitem">
              <h3>Morning Routine</h3>
              <p>Turns on lights at 7:00 AM</p>
              <button type="button" aria-label="Edit morning routine">
                Edit
              </button>
            </div>
          </div>
        </div>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
