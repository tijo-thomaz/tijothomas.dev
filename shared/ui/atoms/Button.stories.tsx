import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { ShieldIcon, LoadingIcon } from './Icon';

const meta: Meta<typeof Button> = {
  title: 'Shared/UI/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'terminal', 'success', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'xs'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Default Button',
  },
};

export const Terminal: Story = {
  args: {
    children: 'Terminal Style',
    variant: 'terminal',
  },
};

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <ShieldIcon size="sm" />
        PromptShield
      </>
    ),
    variant: 'success',
  },
};

export const Loading: Story = {
  args: {
    children: 'Processing...',
    loading: true,
    variant: 'default',
  },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">XS</Button>
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <ShieldIcon />
      </Button>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="terminal">Terminal</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
