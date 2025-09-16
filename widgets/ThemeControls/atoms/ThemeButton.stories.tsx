import type { Meta, StoryObj } from '@storybook/react';
import { ThemeButton } from './ThemeButton';

const meta: Meta<typeof ThemeButton> = {
  title: 'Widgets/Theme Controls/Atoms/ThemeButton',
  component: ThemeButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A dropdown theme selection button with proper accessibility and state management.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isOpen: {
      control: 'boolean',
    },
    currentThemeLabel: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeButton>;

export const Default: Story = {
  args: {
    currentThemeLabel: 'Light',
    isOpen: false,
    onClick: () => {},
  },
};

export const Opened: Story = {
  args: {
    currentThemeLabel: 'Dark',
    isOpen: true,
    onClick: () => {},
  },
};

export const LightTheme: Story = {
  args: {
    currentThemeLabel: 'Light',
    isOpen: false,
    onClick: () => {},
  },
};

export const DarkTheme: Story = {
  args: {
    currentThemeLabel: 'Dark',
    isOpen: false,
    onClick: () => {},
  },
};

export const TerminalTheme: Story = {
  args: {
    currentThemeLabel: 'Terminal',
    isOpen: false,
    onClick: () => {},
  },
};

export const AllThemes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Closed State</h4>
        <div className="flex gap-2">
          <ThemeButton currentThemeLabel="Light" isOpen={false} onClick={() => {}} />
          <ThemeButton currentThemeLabel="Dark" isOpen={false} onClick={() => {}} />
          <ThemeButton currentThemeLabel="Terminal" isOpen={false} onClick={() => {}} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Open State</h4>
        <div className="flex gap-2">
          <ThemeButton currentThemeLabel="Light" isOpen={true} onClick={() => {}} />
          <ThemeButton currentThemeLabel="Dark" isOpen={true} onClick={() => {}} />
          <ThemeButton currentThemeLabel="Terminal" isOpen={true} onClick={() => {}} />
        </div>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Theme buttons are keyboard accessible and provide clear state feedback.
        They use proper ARIA attributes for dropdown functionality.
      </p>
      <div className="flex gap-2" role="group" aria-label="Theme selection">
        <ThemeButton 
          currentThemeLabel="Light" 
          isOpen={false}
          onClick={() => alert('Theme selector opened')}
        />
        <ThemeButton 
          currentThemeLabel="Dark (Active)" 
          isOpen={true}
          onClick={() => alert('Theme selector closed')}
        />
      </div>
      <p className="text-xs text-gray-500">
        Uses aria-expanded and aria-haspopup for screen reader compatibility.
      </p>
    </div>
  ),
};
