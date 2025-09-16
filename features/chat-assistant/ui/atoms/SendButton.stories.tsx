import type { Meta, StoryObj } from '@storybook/react';
import { SendButton } from './SendButton';

const meta: Meta<typeof SendButton> = {
  title: 'Features/Chat Assistant/Atoms/SendButton',
  component: SendButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A themed send button for chat messages with proper accessibility and focus states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof SendButton>;

export const Default: Story = {
  args: {
    onClick: () => {},
  },
};

export const Disabled: Story = {
  args: {
    onClick: () => {},
    disabled: true,
  },
};

export const Interactive: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="p-4 bg-gray-100 rounded">
        <p className="mb-2 text-sm">Normal state:</p>
        <SendButton onClick={() => alert('Sent!')} />
      </div>
      <div className="p-4 bg-gray-100 rounded">
        <p className="mb-2 text-sm">Disabled state:</p>
        <SendButton onClick={() => {}} disabled />
      </div>
    </div>
  ),
};

export const InChatContext: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-4 border rounded-lg bg-white max-w-md">
      <input 
        type="text" 
        placeholder="Type a message..." 
        className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <SendButton onClick={() => alert('Message sent!')} />
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Try tabbing to the button and pressing Enter or Space to activate it.
      </p>
      <SendButton onClick={() => alert('Keyboard accessible!')} />
      <p className="text-xs text-gray-500">
        Screen reader will announce: "Send message, button"
      </p>
    </div>
  ),
};
