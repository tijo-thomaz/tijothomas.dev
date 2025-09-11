import type { Meta, StoryObj } from '@storybook/react';
import { AnimatedDots } from './AnimatedDots';

const meta: Meta<typeof AnimatedDots> = {
  title: 'Features/Chat Assistant/Atoms/AnimatedDots',
  component: AnimatedDots,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Animated typing indicator dots to show when the assistant is processing a response.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AnimatedDots>;

export const Default: Story = {};

export const InChatMessage: Story = {
  render: () => (
    <div className="flex items-start gap-3 p-4 max-w-md">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
        AI
      </div>
      <div className="flex-1 bg-gray-100 rounded-lg p-3">
        <AnimatedDots />
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600">Small (default):</div>
      <AnimatedDots />
      
      <div className="text-sm text-gray-600 mt-6">Large:</div>
      <div style={{ fontSize: '1.5rem' }}>
        <AnimatedDots />
      </div>
      
      <div className="text-sm text-gray-600 mt-6">Extra Large:</div>
      <div style={{ fontSize: '2rem' }}>
        <AnimatedDots />
      </div>
    </div>
  ),
};

export const OnDifferentBackgrounds: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-white border rounded">
        <p className="text-sm mb-2">Light background:</p>
        <AnimatedDots />
      </div>
      
      <div className="p-4 bg-gray-800 text-white rounded">
        <p className="text-sm mb-2">Dark background:</p>
        <AnimatedDots />
      </div>
      
      <div className="p-4 bg-blue-500 text-white rounded">
        <p className="text-sm mb-2">Colored background:</p>
        <AnimatedDots />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        The animated dots provide visual feedback that the system is processing.
        Screen readers will understand this as a "thinking" or "processing" indicator.
      </p>
      <div className="p-4 border rounded bg-gray-50">
        <div className="mb-2 text-sm font-medium">Assistant is thinking...</div>
        <AnimatedDots />
      </div>
    </div>
  ),
};
