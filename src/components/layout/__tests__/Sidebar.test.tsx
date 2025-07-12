import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { Sidebar } from '../Sidebar';
import { CpuChipIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const mockNavigation = [
  {
    name: 'Devices',
    href: '/company/devices',
    icon: CpuChipIcon,
    current: false,
  },
  {
    name: 'Analytics',
    href: '/company/analytics',
    icon: ChartBarIcon,
    current: false,
  },
];

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/company/devices');
  });

  it('renders navigation items correctly', () => {
    render(<Sidebar navigation={mockNavigation} />);

    expect(screen.getByText('Devices')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getAllByText('IoT Platform')).toHaveLength(2); // Desktop and mobile
  });

  it('highlights current page based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/company/devices');
    render(<Sidebar navigation={mockNavigation} />);

    const devicesLink = screen.getAllByText('Devices')[0].closest('a');
    expect(devicesLink).toHaveClass('bg-gray-50', 'dark:bg-gray-800', 'text-indigo-600');
  });

  it('shows mobile menu when hamburger button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar navigation={mockNavigation} />);

    const hamburgerButton = screen.getByRole('button', { name: 'Open sidebar' });
    await user.click(hamburgerButton);

    // Check if mobile menu is visible
    const mobileMenu = screen.getByRole('button', { name: 'Close sidebar' });
    expect(mobileMenu).toBeInTheDocument();
  });

  it('closes mobile menu when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar navigation={mockNavigation} />);

    // Open mobile menu
    const hamburgerButton = screen.getByRole('button', { name: 'Open sidebar' });
    await user.click(hamburgerButton);

    // Close mobile menu
    const closeButton = screen.getByRole('button', { name: 'Close sidebar' });
    await user.click(closeButton);

    // The mobile menu should be hidden
    expect(screen.queryByRole('button', { name: 'Close sidebar' })).not.toBeInTheDocument();
  });

  it('closes mobile menu when navigation link is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar navigation={mockNavigation} />);

    // Open mobile menu
    const hamburgerButton = screen.getByRole('button', { name: 'Open sidebar' });
    await user.click(hamburgerButton);

    // Click on a navigation link in mobile menu
    const mobileDevicesLink = screen.getAllByText('Devices')[0];
    await user.click(mobileDevicesLink);

    // The mobile menu should be hidden
    expect(screen.queryByRole('button', { name: 'Close sidebar' })).not.toBeInTheDocument();
  });

  it('renders icons for navigation items', () => {
    render(<Sidebar navigation={mockNavigation} />);

    // Check if icons are rendered (they should have the shrink-0 class)
    const icons = screen.getAllByTestId('heroicon');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('applies correct hover states', () => {
    (usePathname as jest.Mock).mockReturnValue('/company/other');
    render(<Sidebar navigation={mockNavigation} />);

    const analyticsLink = screen.getAllByText('Analytics')[0].closest('a');
    expect(analyticsLink).toHaveClass('hover:text-indigo-600', 'dark:hover:text-indigo-400');
  });

  it('renders desktop sidebar with correct structure', () => {
    const { container } = render(<Sidebar navigation={mockNavigation} />);

    const desktopSidebar = container.querySelector('.lg\\:fixed');
    expect(desktopSidebar).toBeInTheDocument();
    expect(desktopSidebar).toHaveClass('lg:w-72', 'lg:flex-col');
  });

  it('renders with correct accessibility attributes', () => {
    render(<Sidebar navigation={mockNavigation} />);

    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();

    const lists = screen.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);

    const hamburgerButton = screen.getByRole('button', { name: 'Open sidebar' });
    expect(hamburgerButton).toHaveAttribute('type', 'button');
  });

  it('updates navigation current state correctly', () => {
    const { rerender } = render(<Sidebar navigation={mockNavigation} />);

    // Initially on devices page
    (usePathname as jest.Mock).mockReturnValue('/company/devices');
    rerender(<Sidebar navigation={mockNavigation} />);

    const devicesLink = screen.getAllByText('Devices')[0].closest('a');
    expect(devicesLink).toHaveClass('text-indigo-600');

    // Switch to analytics page
    (usePathname as jest.Mock).mockReturnValue('/company/analytics');
    rerender(<Sidebar navigation={mockNavigation} />);

    const analyticsLink = screen.getAllByText('Analytics')[0].closest('a');
    expect(analyticsLink).toHaveClass('text-indigo-600');
  });
});
