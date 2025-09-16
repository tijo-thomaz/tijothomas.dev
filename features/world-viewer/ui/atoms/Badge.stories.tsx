import type { Meta, StoryObj } from '@storybook/react';
import Badge from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Features/World Viewer/Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A styled badge component for labels, tags, and status indicators with multiple variants and sizes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'gradient'],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Accent: Story = {
  args: {
    children: 'Accent',
    variant: 'accent',
  },
};

export const Gradient: Story = {
  args: {
    children: 'Gradient',
    variant: 'gradient',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3 p-6 bg-gray-900 rounded-lg">
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="gradient">Gradient</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 p-6 bg-gray-900 rounded-lg">
      <div className="flex items-center gap-3">
        <Badge size="xs">Extra Small</Badge>
        <Badge size="sm">Small</Badge>
        <Badge size="md">Medium</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="accent" size="xs">XS Accent</Badge>
        <Badge variant="accent" size="sm">SM Accent</Badge>
        <Badge variant="accent" size="md">MD Accent</Badge>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="gradient" size="xs">XS Gradient</Badge>
        <Badge variant="gradient" size="sm">SM Gradient</Badge>
        <Badge variant="gradient" size="md">MD Gradient</Badge>
      </div>
    </div>
  ),
};

export const TechStack: Story = {
  render: () => (
    <div className="p-6 bg-gray-900 rounded-lg max-w-md">
      <h3 className="text-white font-bold mb-3">Tech Stack</h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="primary" size="sm">React</Badge>
        <Badge variant="secondary" size="sm">TypeScript</Badge>
        <Badge variant="accent" size="sm">Next.js</Badge>
        <Badge variant="gradient" size="sm">Tailwind</Badge>
        <Badge variant="primary" size="sm">Node.js</Badge>
        <Badge variant="secondary" size="sm">PostgreSQL</Badge>
      </div>
    </div>
  ),
};

export const StatusIndicators: Story = {
  render: () => (
    <div className="p-6 bg-gray-900 rounded-lg max-w-md">
      <h3 className="text-white font-bold mb-3">Project Status</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Authentication</span>
          <Badge variant="gradient" size="xs">Complete</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">API Integration</span>
          <Badge variant="accent" size="xs">In Progress</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">UI Polish</span>
          <Badge variant="secondary" size="xs">Pending</Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Testing</span>
          <Badge variant="primary" size="xs">Active</Badge>
        </div>
      </div>
    </div>
  ),
};
