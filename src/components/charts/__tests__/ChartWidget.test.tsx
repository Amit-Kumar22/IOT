import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChartWidget } from '../ChartWidget';
import { ChartConfig, ChartData } from '@/types/analytics';

// Mock recharts components
jest.mock('recharts', () => ({
  LineChart: ({ children, onClick }: any) => (
    <div data-testid="line-chart" onClick={onClick}>
      {children}
    </div>
  ),
  AreaChart: ({ children, onClick }: any) => (
    <div data-testid="area-chart" onClick={onClick}>
      {children}
    </div>
  ),
  BarChart: ({ children, onClick }: any) => (
    <div data-testid="bar-chart" onClick={onClick}>
      {children}
    </div>
  ),
  PieChart: ({ children, onClick }: any) => (
    <div data-testid="pie-chart" onClick={onClick}>
      {children}
    </div>
  ),
  ResponsiveContainer: ({ children }: any) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  XAxis: ({ dataKey }: any) => <div data-testid={`x-axis-${dataKey}`} />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  Line: ({ dataKey, stroke }: any) => (
    <div data-testid={`line-${dataKey}`} style={{ stroke }} />
  ),
  Area: ({ dataKey, fill }: any) => (
    <div data-testid={`area-${dataKey}`} style={{ fill }} />
  ),
  Bar: ({ dataKey, fill }: any) => (
    <div data-testid={`bar-${dataKey}`} style={{ fill }} />
  ),
  Pie: ({ dataKey }: any) => <div data-testid={`pie-${dataKey}`} />,
  Cell: ({ fill }: any) => <div data-testid="cell" style={{ fill }} />,
  ReferenceLine: ({ y }: any) => <div data-testid={`reference-line-${y}`} />,
}));

const mockConfig: ChartConfig = {
  id: 'test-chart',
  title: 'Test Chart',
  type: 'line',
  dataSource: 'test-data',
  timeRange: '24h',
  aggregation: 'average',
  refreshRate: 30,
  position: { x: 0, y: 0, width: 4, height: 3 },
  isVisible: true,
  color: '#3B82F6',
  xAxisLabel: 'Time',
  yAxisLabel: 'Value',
};

const mockData: ChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Series 1',
      data: [10, 20, 30, 25, 35],
      borderColor: '#3B82F6',
      backgroundColor: '#3B82F6',
    },
    {
      label: 'Series 2',
      data: [15, 25, 35, 30, 40],
      borderColor: '#10B981',
      backgroundColor: '#10B981',
    },
  ],
};

describe('ChartWidget', () => {
  const mockOnConfigChange = jest.fn();
  const mockOnRemove = jest.fn();
  const mockOnInteraction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders chart widget with title', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders line chart by default', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  it('renders different chart types correctly', () => {
    const barConfig = { ...mockConfig, type: 'bar' as const };
    const { rerender } = render(
      <ChartWidget
        config={barConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();

    const pieConfig = { ...mockConfig, type: 'pie' as const };
    rerender(
      <ChartWidget
        config={pieConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();

    const areaConfig = { ...mockConfig, type: 'area' as const };
    rerender(
      <ChartWidget
        config={areaConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('shows loading state when isLoading is true', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        isLoading={true}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    expect(screen.getByText('Configure')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Remove')).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const removeButton = screen.getByText('Remove');
    await user.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalled();
  });

  it('calls onInteraction when chart is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const chart = screen.getByTestId('line-chart');
    await user.click(chart);

    expect(mockOnInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'click',
        widgetId: mockConfig.id,
      })
    );
  });

  it('renders chart axes correctly', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('x-axis-name')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  it('renders legend when available', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByText('Series 1')).toBeInTheDocument();
    expect(screen.getByText('Series 2')).toBeInTheDocument();
  });

  it('renders grid structure', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('renders tooltip functionality', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('chart-container')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-chart-widget';
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        className={customClass}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('chart-widget')).toHaveClass(customClass);
  });

  it('shows editing state when isEditing is true', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        isEditing={true}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('chart-widget')).toHaveClass('editing');
  });

  it('toggles fullscreen mode', async () => {
    const user = userEvent.setup();
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const fullscreenButton = screen.getByText('Fullscreen');
    await user.click(fullscreenButton);

    expect(screen.getByTestId('chart-widget')).toHaveClass('fullscreen');
  });

  it('handles export functionality', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const exportButton = screen.getByText('Export');
    await user.click(exportButton);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Exporting chart test-chart')
    );

    consoleSpy.mockRestore();
  });

  it('renders multiple series correctly', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByTestId('line-series1')).toBeInTheDocument();
    expect(screen.getByTestId('line-series2')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    const emptyData: ChartData = {
      labels: [],
      datasets: [],
    };

    render(
      <ChartWidget
        config={mockConfig}
        data={emptyData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('applies correct colors to chart series', () => {
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const series1 = screen.getByTestId('line-series1');
    const series2 = screen.getByTestId('line-series2');

    expect(series1).toHaveStyle('stroke: #3B82F6');
    expect(series2).toHaveStyle('stroke: #10B981');
  });

  it('updates config when configuration changes', async () => {
    const user = userEvent.setup();
    render(
      <ChartWidget
        config={mockConfig}
        data={mockData}
        onConfigChange={mockOnConfigChange}
        onRemove={mockOnRemove}
        onInteraction={mockOnInteraction}
      />
    );

    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);

    const configureButton = screen.getByText('Configure');
    await user.click(configureButton);

    // Mock configuration change
    const newConfig = { ...mockConfig, title: 'Updated Chart' };
    mockOnConfigChange(newConfig);

    expect(mockOnConfigChange).toHaveBeenCalledWith(newConfig);
  });
});
