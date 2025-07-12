import { render, screen, fireEvent } from '@testing-library/react';
import { EnergyGauge } from '@/components/consumer/energy/EnergyGauge';
import { UsageChart } from '@/components/consumer/energy/UsageChart';
import { CostPredictor } from '@/components/consumer/energy/CostPredictor';
import { EfficiencyScore } from '@/components/consumer/energy/EfficiencyScore';
import { SavingsTips } from '@/components/consumer/energy/SavingsTips';
import { EnergyData, EnergyStats, EnergyUsageHistory, CostPrediction, EfficiencyMetrics, EnergySavingsTip, UserProfile, RatePlan } from '@/types/energy';

// Mock recharts
jest.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  Area: () => <div data-testid="area" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  RadialBarChart: ({ children }: any) => <div data-testid="radial-bar-chart">{children}</div>,
  RadialBar: () => <div data-testid="radial-bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />,
  ReferenceLine: () => <div data-testid="reference-line" />
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    path: ({ children, ...props }: any) => <path {...props}>{children}</path>
  }
}));

describe('Energy Management Components', () => {
  const mockEnergyData: EnergyData = {
    timestamp: new Date('2025-01-01T10:00:00Z'),
    currentConsumption: 3.2,
    currentCost: 0.38,
    dailyUsage: 24.7,
    dailyCost: 2.96,
    weeklyUsage: 186.3,
    weeklyCost: 22.36,
    monthlyUsage: 847.2,
    monthlyCost: 101.66,
    totalConsumption: 1200,
    cost: 144.50,
    peakHours: [
      { startTime: '14:00', endTime: '20:00' }
    ],
    efficiency: {
      score: 92,
      rating: 'high',
      suggestions: ['optimize_heating'],
      trendsDirection: 'up'
    },
    comparison: {
      vsYesterday: -8,
      vsLastWeek: -12,
      vsLastMonth: -15
    },
    breakdown: [
      { category: 'Heating/Cooling', usage: 12.1, percentage: 49, cost: 1.45 },
      { category: 'Lighting', usage: 3.1, percentage: 13, cost: 0.37 }
    ],
    deviceBreakdown: [
      { 
        deviceId: 'hvac-1', 
        deviceName: 'HVAC System',
        deviceType: 'climate',
        room: 'Living Room',
        consumption: 2.5, 
        cost: 0.30, 
        efficiency: 'high',
        percentage: 60
      },
      { 
        deviceId: 'lights-1', 
        deviceName: 'LED Lights',
        deviceType: 'lighting',
        room: 'Kitchen',
        consumption: 0.8, 
        cost: 0.10, 
        efficiency: 'high',
        percentage: 20
      }
    ]
  };

  const mockEnergyStats: EnergyStats = {
    daily: { average: 24.5, peak: 35.2, total: 24.7 },
    weekly: { average: 26.6, peak: 38.1, total: 186.3 },
    monthly: { average: 27.3, peak: 42.0, total: 847.2 }
  };

  const mockUsageHistory: EnergyUsageHistory = {
    period: 'daily',
    data: [
      { 
        timestamp: new Date('2025-01-01T00:00:00Z'), 
        consumption: 2.1, 
        cost: 0.25, 
        weather: { temperature: 68, humidity: 45, condition: 'clear' } 
      },
      { 
        timestamp: new Date('2025-01-01T01:00:00Z'), 
        consumption: 1.8, 
        cost: 0.22, 
        weather: { temperature: 67, humidity: 46, condition: 'clear' } 
      }
    ]
  };

  const mockCostPredictions: CostPrediction[] = [
    {
      period: 'month',
      predicted: 105.50,
      factors: ['current_usage', 'weather_forecast']
    }
  ];

  const mockEfficiencyMetrics: EfficiencyMetrics = {
    score: 92,
    rating: 'high',
    suggestions: ['optimize_heating'],
    trendsDirection: 'up'
  };

  const mockSavingsTips: EnergySavingsTip[] = [
    {
      id: '1',
      title: 'Lower thermostat at night',
      description: 'Set your thermostat 7-10°F lower when sleeping',
      category: 'heating',
      difficulty: 'easy',
      potentialSavings: 18,
      estimatedTime: '2 minutes',
      priority: 'high',
      steps: ['Locate thermostat', 'Set schedule'],
      tools: ['Programmable thermostat']
    }
  ];

  const mockUserProfile: UserProfile = {
    homeType: 'house',
    householdSize: 4,
    averageUsage: 850,
    primaryHeatingSource: 'gas',
    hasSmartDevices: true,
    energyGoals: ['reduce_cost']
  };

  const mockRatePlan: RatePlan = {
    id: 'standard',
    name: 'Standard Residential',
    provider: 'City Electric',
    type: 'tiered',
    rates: {
      base: 0.12,
      peak: 0.18,
      offPeak: 0.08,
      tiers: [
        { threshold: 500, rate: 0.10 },
        { threshold: 1000, rate: 0.12 }
      ]
    },
    peakHours: [
      { startTime: '14:00', endTime: '20:00' }
    ],
    monthlyFee: 12.50
  };

  describe('EnergyGauge', () => {
    it('renders current consumption correctly', () => {
      render(<EnergyGauge energyData={mockEnergyData} energyStats={mockEnergyStats} />);
      
      expect(screen.getByText('3.2')).toBeInTheDocument();
      expect(screen.getByText('kWh')).toBeInTheDocument();
    });

    it('displays cost information', () => {
      render(<EnergyGauge energyData={mockEnergyData} energyStats={mockEnergyStats} showCost={true} />);
      
      expect(screen.getByText('$0.38')).toBeInTheDocument();
    });

    it('shows efficiency rating', () => {
      render(<EnergyGauge energyData={mockEnergyData} energyStats={mockEnergyStats} showEfficiency={true} />);
      
      expect(screen.getByText('92')).toBeInTheDocument();
    });

    it('displays loading state', () => {
      render(<EnergyGauge energyData={mockEnergyData} energyStats={mockEnergyStats} isLoading={true} />);
      
      // Should show loading skeleton or spinner
      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('UsageChart', () => {
    it('renders chart with data', () => {
      render(<UsageChart data={mockUsageHistory} />);
      
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('handles chart type selection', () => {
      render(<UsageChart data={mockUsageHistory} />);
      
      const lineButton = screen.getByText('Line');
      const areaButton = screen.getByText('Area');
      const barButton = screen.getByText('Bar');
      
      expect(lineButton).toBeInTheDocument();
      expect(areaButton).toBeInTheDocument();
      expect(barButton).toBeInTheDocument();
      
      fireEvent.click(areaButton);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });

    it('handles period selection', () => {
      render(<UsageChart data={mockUsageHistory} />);
      
      const periodSelect = screen.getByRole('combobox');
      fireEvent.change(periodSelect, { target: { value: 'weekly' } });
      
      expect(screen.getByDisplayValue('Weekly')).toBeInTheDocument();
    });
  });

  describe('CostPredictor', () => {
    it('renders cost predictions', () => {
      render(
        <CostPredictor
          currentUsage={3.2}
          ratePlan={mockRatePlan}
          predictions={mockCostPredictions}
        />
      );
      
      expect(screen.getByText('$105.50')).toBeInTheDocument();
    });

    it('displays budget status when budget is set', () => {
      render(
        <CostPredictor
          currentUsage={3.2}
          ratePlan={mockRatePlan}
          predictions={mockCostPredictions}
          targetBudget={100}
        />
      );
      
      expect(screen.getByText('Budget Alert')).toBeInTheDocument();
    });
  });

  describe('EfficiencyScore', () => {
    it('renders efficiency score', () => {
      render(<EfficiencyScore metrics={mockEfficiencyMetrics} />);
      
      expect(screen.getByText('92')).toBeInTheDocument();
    });

    it('displays suggestions', () => {
      render(<EfficiencyScore metrics={mockEfficiencyMetrics} />);
      
      expect(screen.getByText('Suggestions')).toBeInTheDocument();
    });
  });

  describe('SavingsTips', () => {
    const mockOnTipComplete = jest.fn();
    const mockOnTipDismiss = jest.fn();

    beforeEach(() => {
      mockOnTipComplete.mockClear();
      mockOnTipDismiss.mockClear();
    });

    it('renders savings tips', () => {
      render(
        <SavingsTips
          tips={mockSavingsTips}
          userProfile={mockUserProfile}
          onTipComplete={mockOnTipComplete}
          onTipDismiss={mockOnTipDismiss}
        />
      );
      
      expect(screen.getByText('Lower thermostat at night')).toBeInTheDocument();
      expect(screen.getByText('$18')).toBeInTheDocument();
    });

    it('shows category filter', () => {
      render(
        <SavingsTips
          tips={mockSavingsTips}
          userProfile={mockUserProfile}
          onTipComplete={mockOnTipComplete}
          onTipDismiss={mockOnTipDismiss}
        />
      );
      
      expect(screen.getByText('All Categories')).toBeInTheDocument();
    });

    it('expands tip details', () => {
      render(
        <SavingsTips
          tips={mockSavingsTips}
          userProfile={mockUserProfile}
          onTipComplete={mockOnTipComplete}
          onTipDismiss={mockOnTipDismiss}
        />
      );
      
      const expandButton = screen.getByText('View Details');
      fireEvent.click(expandButton);
      
      expect(screen.getByText('Steps:')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles missing data gracefully', () => {
      const emptyData: EnergyData = {
        timestamp: new Date(),
        currentConsumption: 0,
        currentCost: 0,
        dailyUsage: 0,
        dailyCost: 0,
        weeklyUsage: 0,
        weeklyCost: 0,
        monthlyUsage: 0,
        monthlyCost: 0,
        totalConsumption: 0,
        cost: 0,
        peakHours: [],
        efficiency: {
          score: 0,
          rating: 'low',
          suggestions: [],
          trendsDirection: 'stable'
        },
        comparison: {
          vsYesterday: 0,
          vsLastWeek: 0,
          vsLastMonth: 0
        },
        breakdown: [],
        deviceBreakdown: []
      };

      render(<EnergyGauge energyData={emptyData} energyStats={mockEnergyStats} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('displays error states for components', () => {
      const errorData = {
        ...mockUsageHistory,
        data: []
      };

      render(<UsageChart data={errorData} />);
      expect(screen.getByText('No data available')).toBeInTheDocument();
    });
  });
});
