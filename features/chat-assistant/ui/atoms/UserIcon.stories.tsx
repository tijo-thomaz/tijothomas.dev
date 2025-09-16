import type { Meta, StoryObj } from '@storybook/react';
import { UserIcon } from './UserIcon';

const meta: Meta<typeof UserIcon> = {
  title: 'Features/Chat Assistant/Atoms/UserIcon',
  component: UserIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A themed user icon component for identifying user messages in chat.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
    },
    color: {
      control: 'color',
    },
  },
};

export default meta;
type Story = StoryObj<typeof UserIcon>;

export const Default: Story = {};

export const Small: Story = {
  args: {
    className: 'w-3 h-3',
  },
};

export const Medium: Story = {
  args: {
    className: 'w-5 h-5',
  },
};

export const Large: Story = {
  args: {
    className: 'w-8 h-8',
  },
};

export const CustomColor: Story = {
  args: {
    color: '#3b82f6',
    className: 'w-6 h-6',
  },
};

export const InChatMessage: Story = {
  render: () => (
    <div className="flex items-start gap-3 p-4 max-w-md">
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
        <UserIcon className="w-4 h-4" color="white" />
      </div>
      <div className="flex-1 bg-blue-500 text-white rounded-lg p-3">
        Hello! This is a user message with the user icon.
      </div>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <UserIcon className="w-4 h-4" />
        <span>Default size and color</span>
      </div>
      <div className="flex items-center gap-4">
        <UserIcon className="w-6 h-6" color="#10b981" />
        <span>Medium green</span>
      </div>
      <div className="flex items-center gap-4">
        <UserIcon className="w-8 h-8" color="#dc2626" />
        <span>Large red</span>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        The icon has aria-hidden="true" since it's decorative and context is provided by surrounding content.
      </p>
      <div className="flex items-center gap-2 p-3 border rounded">
        <UserIcon className="w-5 h-5" />
        <span>User message content</span>
      </div>
    </div>
  ),
};
