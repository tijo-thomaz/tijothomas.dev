import type { Meta, StoryObj } from '@storybook/react';
import { TerminalInput } from './TerminalInput';

const meta: Meta<typeof TerminalInput> = {
  title: 'Features/Terminal/Atoms/TerminalInput',
  component: TerminalInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Terminal command input field with auto-typing support and terminal styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    isAutoTyping: {
      control: 'boolean',
      description: 'Shows auto-typing placeholder and makes input read-only',
    },
    disabled: {
      control: 'boolean',
    },
    value: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TerminalInput>;

export const Default: Story = {
  args: {
    value: '',
    placeholder: 'Enter command...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'help',
    placeholder: 'Enter command...',
  },
};

export const AutoTyping: Story = {
  args: {
    value: 'about',
    isAutoTyping: true,
  },
};

export const Disabled: Story = {
  args: {
    value: 'processing...',
    disabled: true,
  },
};

export const Interactive: Story = {
  args: {
    value: '',
    placeholder: 'Try typing a command...',
  },
  play: async ({ canvasElement }) => {
    // This could include interactions for testing
  },
};
