import type { Meta, StoryObj } from '@storybook/react';
import { QuickReplyButton } from './QuickReplyButton';

const meta: Meta<typeof QuickReplyButton> = {
  title: 'Features/Chat Assistant/Atoms/QuickReplyButton',
  component: QuickReplyButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A quick reply button for suggesting common responses in the chat interface.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof QuickReplyButton>;

export const Default: Story = {
  args: {
    text: 'Quick Reply',
    onClick: () => {},
  },
};

export const GetStarted: Story = {
  args: {
    text: 'Get Started',
    onClick: () => {},
  },
};

export const ViewProjects: Story = {
  args: {
    text: 'View Projects',
    onClick: () => {},
  },
};

export const ShowResume: Story = {
  args: {
    text: 'Show Resume',
    onClick: () => {},
  },
};

export const ContactInfo: Story = {
  args: {
    text: 'Contact Info',
    onClick: () => {},
  },
};

export const Disabled: Story = {
  args: {
    text: 'Disabled Button',
    disabled: true,
    onClick: () => {},
  },
};

export const QuickReplies: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <p className="text-sm text-gray-600">Common quick replies:</p>
      <div className="flex flex-wrap gap-2">
        <QuickReplyButton text="Get Started" onClick={() => alert('Getting started!')} />
        <QuickReplyButton text="View Projects" onClick={() => alert('Showing projects!')} />
        <QuickReplyButton text="Show Resume" onClick={() => alert('Showing resume!')} />
        <QuickReplyButton text="Contact Info" onClick={() => alert('Showing contact!')} />
      </div>
    </div>
  ),
};

export const InChatInterface: Story = {
  render: () => (
    <div className="max-w-lg p-4 bg-gray-50 rounded-lg">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            AI
          </div>
          <div className="flex-1 bg-white rounded-lg p-3">
            <p className="text-gray-800">
              Hi! I'm Tijo's AI assistant. How can I help you today?
            </p>
          </div>
        </div>
        
        <div className="ml-11 space-y-2">
          <p className="text-sm text-gray-600">Quick options:</p>
          <div className="flex flex-wrap gap-2">
            <QuickReplyButton text="Tell me about Tijo" onClick={() => alert('Tell me about Tijo')} />
            <QuickReplyButton text="Show his work" onClick={() => alert('Show his work')} />
            <QuickReplyButton text="Get in touch" onClick={() => alert('Contact information')} />
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Quick reply buttons are fully keyboard accessible and provide clear interaction feedback.
        Try tabbing through them and pressing Enter or Space.
      </p>
      <div className="flex flex-wrap gap-2">
        <QuickReplyButton text="Keyboard Accessible" onClick={() => alert('Accessible button clicked!')} />
        <QuickReplyButton text="Focus Visible" onClick={() => alert('Focus visible!')} />
        <QuickReplyButton text="Screen Reader Ready" onClick={() => alert('Screen reader friendly!')} />
      </div>
      <p className="text-xs text-gray-500">
        Buttons have proper focus indicators and announce their purpose to screen readers.
      </p>
    </div>
  ),
};
