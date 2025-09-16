import type { Meta, StoryObj } from '@storybook/react';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Features/World Viewer/Atoms/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile card component with multiple variants and interactive states for the world viewer interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'highlight', 'transparent', 'glass'],
    },
    hover: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    children: 'Default card content',
  },
};

export const Highlight: Story = {
  args: {
    children: 'Highlight card with gradient border',
    variant: 'highlight',
  },
};

export const Glass: Story = {
  args: {
    children: 'Glass card with backdrop blur',
    variant: 'glass',
  },
};

export const Transparent: Story = {
  args: {
    children: 'Transparent card without background',
    variant: 'transparent',
  },
};

export const NoHover: Story = {
  args: {
    children: 'Card without hover effects',
    hover: false,
  },
};

export const Interactive: Story = {
  args: {
    children: 'Click me!',
    onClick: () => alert('Card clicked!'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 p-8 bg-gradient-to-br from-gray-900 to-black">
      <Card variant="default">
        <div className="p-4">
          <h3 className="text-white font-bold mb-2">Default</h3>
          <p className="text-gray-300">Standard card with backdrop blur</p>
        </div>
      </Card>
      
      <Card variant="highlight">
        <div className="p-4">
          <h3 className="text-white font-bold mb-2">Highlight</h3>
          <p className="text-gray-300">Featured card with gradient border</p>
        </div>
      </Card>
      
      <Card variant="glass">
        <div className="p-4">
          <h3 className="text-white font-bold mb-2">Glass</h3>
          <p className="text-gray-300">Enhanced glass effect with shadow</p>
        </div>
      </Card>
      
      <Card variant="transparent">
        <div className="p-4">
          <h3 className="text-white font-bold mb-2">Transparent</h3>
          <p className="text-gray-300">No background, content only</p>
        </div>
      </Card>
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-gray-900 to-black">
      <Card variant="glass" className="max-w-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 border border-green-400/40 flex items-center justify-center">
              <span className="text-green-400 text-lg">🚀</span>
            </div>
            <div>
              <h3 className="text-white font-bold">Project Title</h3>
              <p className="text-gray-400 text-sm">Next.js Application</p>
            </div>
          </div>
          <p className="text-gray-300 text-sm mb-4">
            A modern web application built with Next.js, featuring responsive design and interactive elements.
          </p>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">React</span>
            <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-xs">TypeScript</span>
          </div>
        </div>
      </Card>
    </div>
  ),
};

export const HoverStates: Story = {
  render: () => (
    <div className="space-y-4 p-8 bg-gradient-to-br from-gray-900 to-black">
      <p className="text-white text-sm">Hover over the cards to see the effects:</p>
      <div className="grid grid-cols-2 gap-4">
        <Card variant="default">
          <div className="p-4 text-center">
            <p className="text-white">Hover enabled (default)</p>
          </div>
        </Card>
        <Card variant="default" hover={false}>
          <div className="p-4 text-center">
            <p className="text-white">Hover disabled</p>
          </div>
        </Card>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4 p-8 bg-gradient-to-br from-gray-900 to-black">
      <p className="text-white text-sm mb-4">
        Cards provide visual hierarchy and grouping:
      </p>
      <Card variant="highlight">
        <div className="p-4 text-center">
          <p className="text-white">Interactive card with clear focus states</p>
        </div>
      </Card>
    </div>
  ),
};
