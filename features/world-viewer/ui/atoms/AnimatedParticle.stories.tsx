import type { Meta, StoryObj } from '@storybook/react';
import AnimatedParticle from './AnimatedParticle';

const meta: Meta<typeof AnimatedParticle> = {
  title: 'Features/World Viewer/Atoms/AnimatedParticle',
  component: AnimatedParticle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'An animated particle component for creating dynamic visual effects in the world viewer.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
    color: {
      control: 'select',
      options: ['blue', 'green', 'purple', 'yellow'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedParticle>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    size: 'xs',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
  },
};

export const Green: Story = {
  args: {
    color: 'green',
  },
};

export const Purple: Story = {
  args: {
    color: 'purple',
  },
};

export const Yellow: Story = {
  args: {
    color: 'yellow',
  },
};

export const ColorVariations: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-6 bg-gray-900 rounded-lg">
      <AnimatedParticle color="blue" size="sm" />
      <AnimatedParticle color="green" size="sm" />
      <AnimatedParticle color="purple" size="sm" />
      <AnimatedParticle color="yellow" size="sm" />
    </div>
  ),
};

export const SizeVariations: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-6 bg-gray-900 rounded-lg">
      <div className="text-center">
        <AnimatedParticle size="xs" />
        <p className="text-white text-xs mt-2">XS</p>
      </div>
      <div className="text-center">
        <AnimatedParticle size="sm" />
        <p className="text-white text-xs mt-2">SM</p>
      </div>
      <div className="text-center">
        <AnimatedParticle size="md" />
        <p className="text-white text-xs mt-2">MD</p>
      </div>
    </div>
  ),
};

export const AccessibilityNote: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Animated particles are purely decorative and don't convey essential information.
        They respect user's motion preferences and can be disabled for accessibility.
      </p>
      <div className="p-4 bg-gray-900 rounded-lg">
        <AnimatedParticle />
      </div>
      <p className="text-xs text-gray-500">
        Note: In production, animations should respect prefers-reduced-motion media query.
      </p>
    </div>
  ),
};
