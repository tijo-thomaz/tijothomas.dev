import type { Meta, StoryObj } from '@storybook/react';
import { StatCard } from './StatCard';

const meta: Meta<typeof StatCard> = {
  title: 'Widgets/Analytics/Atoms/StatCard',
  component: StatCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A themed card component for displaying statistics with consistent monospace typography.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    value: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    label: 'Total Views',
    value: '1,234',
  },
};

export const PageViews: Story = {
  args: {
    label: 'Page Views',
    value: '5,678',
  },
};

export const UniqueVisitors: Story = {
  args: {
    label: 'Unique Visitors',
    value: '892',
  },
};

export const BounceRate: Story = {
  args: {
    label: 'Bounce Rate',
    value: '23.5%',
  },
};

export const LargeNumber: Story = {
  args: {
    label: 'Total Downloads',
    value: '1,234,567',
  },
};

export const SmallNumber: Story = {
  args: {
    label: 'Errors',
    value: '0',
  },
};

export const Dashboard: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-6 bg-gray-100 rounded-lg max-w-md">
      <StatCard label="Page Views" value="12,345" />
      <StatCard label="Visitors" value="2,847" />
      <StatCard label="Bounce Rate" value="34.2%" />
      <StatCard label="Avg. Session" value="4m 32s" />
    </div>
  ),
};

export const DifferentValueTypes: Story = {
  render: () => (
    <div className="space-y-4 max-w-xs">
      <StatCard label="Count" value={42} />
      <StatCard label="Percentage" value="87.5%" />
      <StatCard label="Currency" value="$1,234.56" />
      <StatCard label="Time" value="2h 15m" />
      <StatCard label="Version" value="v2.1.0" />
      <StatCard label="Status" value="Online" />
    </div>
  ),
};

export const AnalyticsGrid: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3 p-6 bg-gray-900 rounded-lg max-w-2xl">
      <StatCard label="Terminal Commands" value="147" />
      <StatCard label="Chat Messages" value="89" />
      <StatCard label="Theme Changes" value="12" />
      <StatCard label="Session Duration" value="24m 36s" />
      <StatCard label="Features Used" value="8" />
      <StatCard label="Uptime" value="99.9%" />
    </div>
  ),
};

export const RealTimeData: Story = {
  render: () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-800">Real-time Analytics</h3>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <StatCard label="Active Users" value="23" />
        <StatCard label="Current Page" value="/portfolio" />
        <StatCard label="Avg. Load Time" value="1.2s" />
        <StatCard label="CPU Usage" value="34%" />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Stat cards use semantic markup with clear label-value relationships.
        Screen readers will announce both the label and value.
      </p>
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <StatCard 
          label="Success Rate" 
          value="98.5%" 
        />
        <StatCard 
          label="Failed Requests" 
          value="12" 
        />
      </div>
      <p className="text-xs text-gray-500">
        Values use monospace font for better readability of numbers.
      </p>
    </div>
  ),
};
