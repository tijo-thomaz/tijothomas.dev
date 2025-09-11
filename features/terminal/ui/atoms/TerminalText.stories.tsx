import type { Meta, StoryObj } from '@storybook/react';
import { TerminalText } from './TerminalText';

const meta: Meta<typeof TerminalText> = {
  title: 'Features/Terminal/Atoms/TerminalText',
  component: TerminalText,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A styled text component for terminal output with various styling variants.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'error', 'success', 'muted', 'accent'],
    },
    size: {
      control: 'select', 
      options: ['xs', 'sm', 'base'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TerminalText>;

export const Default: Story = {
  args: {
    children: 'Default terminal text',
    variant: 'default',
    size: 'base',
  },
};

export const Error: Story = {
  args: {
    children: 'Error: Command not found',
    variant: 'error',
    size: 'base',
  },
};

export const Success: Story = {
  args: {
    children: '✅ Command executed successfully',
    variant: 'success',
    size: 'base',
  },
};

export const Muted: Story = {
  args: {
    children: 'Muted helper text',
    variant: 'muted',
    size: 'xs',
  },
};

export const MultilineOutput: Story = {
  args: {
    children: `🛡️ PromptShield - AI Safety Platform

Features:
• Prompt injection detection
• Toxicity filtering
• Response validation

Status: Production Ready`,
    variant: 'default',
    size: 'base',
  },
};

export const CodeOutput: Story = {
  args: {
    children: `const promptShield = {
  version: "2.1.0",
  status: "production",
  features: ["safety", "validation"]
};`,
    variant: 'accent',
    size: 'sm',
  },
};
