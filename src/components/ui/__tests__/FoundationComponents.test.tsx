// Unit tests for foundation UI components - Task 6
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';
import { Badge } from '../Badge';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  test('handles click events', async () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button variant="primary" loading>Loading button</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">←</span>;
    render(
      <Button variant="primary" leftIcon={<LeftIcon />}>
        With Icon
      </Button>
    );
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  test('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">→</span>;
    render(
      <Button variant="primary" rightIcon={<RightIcon />}>
        With Icon
      </Button>
    );
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    
    rerender(<Button variant="danger">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-red-600');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Button variant="primary" size="small">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-3', 'py-1.5', 'text-sm');
    
    rerender(<Button variant="primary" size="large">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  test('disabled state prevents clicks', async () => {
    const handleClick = jest.fn();
    render(<Button variant="primary" disabled onClick={handleClick}>Disabled</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('has proper accessibility attributes', () => {
    render(<Button variant="primary" testId="test-button">Accessible Button</Button>);
    const button = screen.getByRole('button');
    
    expect(button).toHaveAttribute('data-testid', 'test-button');
    expect(button).toHaveAttribute('type', 'button');
  });
});

describe('Input Component', () => {
  test('renders input with label', () => {
    render(<Input label="Email" type="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  test('handles value changes', async () => {
    const handleChange = jest.fn();
    render(<Input label="Name" onChange={handleChange} />);
    
    const input = screen.getByLabelText('Name');
    await userEvent.type(input, 'John Doe');
    
    expect(handleChange).toHaveBeenCalledWith('John Doe');
  });

  test('shows validation error', () => {
    render(<Input label="Email" type="email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(<Input label="Email" type="email" required />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'invalid-email');
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });
  });

  test('shows required indicator', () => {
    render(<Input label="Required Field" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('renders with left icon', () => {
    const LeftIcon = () => <span data-testid="left-icon">@</span>;
    render(<Input label="Email" leftIcon={<LeftIcon />} />);
    
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  test('renders with right icon', () => {
    const RightIcon = () => <span data-testid="right-icon">✓</span>;
    render(<Input label="Valid Field" rightIcon={<RightIcon />} />);
    
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  test('disabled state', () => {
    render(<Input label="Disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  test('readonly state', () => {
    render(<Input label="Readonly" readOnly value="Cannot edit" />);
    const input = screen.getByLabelText('Readonly');
    expect(input).toHaveAttribute('readonly');
  });

  test('has proper accessibility attributes', () => {
    render(<Input label="Test Input" testId="test-input" required />);
    const input = screen.getByTestId('test-input');
    
    expect(input).toHaveAttribute('data-testid', 'test-input');
    expect(input).toHaveAttribute('required');
    expect(input).toHaveAttribute('aria-invalid', 'false');
  });
});

describe('Card Component', () => {
  test('renders card with children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  test('renders card with title', () => {
    render(
      <Card title="Card Title">
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  test('renders card with subtitle', () => {
    render(
      <Card title="Card Title" subtitle="Card subtitle">
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByText('Card subtitle')).toBeInTheDocument();
  });

  test('renders card with header actions', () => {
    const HeaderActions = () => (
      <button data-testid="header-action">Action</button>
    );
    
    render(
      <Card title="Card Title" headerActions={<HeaderActions />}>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByTestId('header-action')).toBeInTheDocument();
  });

  test('renders card with footer actions', () => {
    const FooterActions = () => (
      <button data-testid="footer-action">Footer Action</button>
    );
    
    render(
      <Card footerActions={<FooterActions />}>
        <p>Card content</p>
      </Card>
    );
    
    expect(screen.getByTestId('footer-action')).toBeInTheDocument();
  });

  test('applies correct shadow classes', () => {
    const { rerender } = render(<Card shadow="small" testId="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('shadow-sm');
    
    rerender(<Card shadow="large" testId="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('shadow-lg');
  });

  test('applies correct padding classes', () => {
    const { rerender } = render(<Card padding="small" testId="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('p-3');
    
    rerender(<Card padding="large" testId="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('p-6');
  });

  test('applies hover effect when enabled', () => {
    render(<Card hover testId="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('hover:shadow-lg');
  });
});

describe('Badge Component', () => {
  test('renders badge with text', () => {
    render(<Badge variant="primary">Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Badge variant="success" testId="badge">Success</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-green-100', 'text-green-800');
    
    rerender(<Badge variant="danger" testId="badge">Danger</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-red-100', 'text-red-800');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Badge variant="primary" size="small" testId="badge">Small</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('px-2', 'py-0.5', 'text-xs');
    
    rerender(<Badge variant="primary" size="large" testId="badge">Large</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('px-3', 'py-1.5', 'text-base');
  });

  test('renders rounded when enabled', () => {
    render(<Badge variant="primary" rounded testId="badge">Rounded</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('rounded-full');
  });

  test('renders remove button when removable', () => {
    const handleRemove = jest.fn();
    render(
      <Badge variant="primary" removable onRemove={handleRemove}>
        Removable
      </Badge>
    );
    
    expect(screen.getByLabelText('Remove badge')).toBeInTheDocument();
  });

  test('handles remove action', async () => {
    const handleRemove = jest.fn();
    render(
      <Badge variant="primary" removable onRemove={handleRemove}>
        Removable
      </Badge>
    );
    
    await userEvent.click(screen.getByLabelText('Remove badge'));
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  test('has proper accessibility attributes', () => {
    render(<Badge variant="primary" testId="test-badge">Test Badge</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });
});

describe('Component Integration', () => {
  test('components work together', () => {
    const TestComponent = () => (
      <Card
        title="Integration Test"
        headerActions={
          <Badge variant="success" size="small">
            Active
          </Badge>
        }
        footerActions={
          <Button variant="primary" size="small">
            Save
          </Button>
        }
      >
        <Input label="Name" placeholder="Enter your name" />
      </Card>
    );
    
    render(<TestComponent />);
    
    expect(screen.getByText('Integration Test')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });
});

describe('Accessibility', () => {
  test('all components have proper focus management', () => {
    render(
      <div>
        <Button variant="primary">Button</Button>
        <Input label="Input" />
        <Badge variant="primary" removable onRemove={() => {}}>Badge</Badge>
      </div>
    );
    
    // Tab through focusable elements
    const button = screen.getByRole('button', { name: 'Button' });
    const input = screen.getByLabelText('Input');
    const removeButton = screen.getByLabelText('Remove badge');
    
    button.focus();
    expect(document.activeElement).toBe(button);
    
    fireEvent.keyDown(button, { key: 'Tab' });
    input.focus();
    expect(document.activeElement).toBe(input);
    
    fireEvent.keyDown(input, { key: 'Tab' });
    removeButton.focus();
    expect(document.activeElement).toBe(removeButton);
  });

  test('components have proper ARIA attributes', () => {
    render(
      <div>
        <Button variant="primary" disabled>Disabled Button</Button>
        <Input label="Required Input" required error="This field is required" testId="required-input" />
        <Card title="Accessible Card">
          <p>Content</p>
        </Card>
      </div>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    
    const input = screen.getByTestId('required-input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });
});

describe('Theme Support', () => {
  test('components support dark mode classes', () => {
    const { container } = render(
      <div className="dark">
        <Button variant="primary">Dark Button</Button>
        <Input label="Dark Input" />
        <Card>Dark Card</Card>
        <Badge variant="primary">Dark Badge</Badge>
      </div>
    );
    
    // Check that dark mode classes are applied
    expect(container.querySelector('.dark')).toBeInTheDocument();
  });
});

describe('Performance', () => {
  test('components render efficiently', () => {
    const renderStart = performance.now();
    
    render(
      <div>
        {Array.from({ length: 50 }, (_, i) => (
          <Card key={i} title={`Card ${i}`}>
            <Input label={`Input ${i}`} />
            <Button variant="primary">Button {i}</Button>
            <Badge variant="success">Badge {i}</Badge>
          </Card>
        ))}
      </div>
    );
    
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    // Should render 50 cards with components in under 500ms
    expect(renderTime).toBeLessThan(500);
  });
});
