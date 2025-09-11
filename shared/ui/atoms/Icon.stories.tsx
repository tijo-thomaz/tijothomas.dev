import type { Meta, StoryObj } from '@storybook/react';
import { 
  ChevronRightIcon, 
  ChevronDownIcon, 
  SendIcon, 
  ShieldIcon, 
  LoadingIcon, 
  TerminalIcon 
} from './Icon';

const meta: Meta<typeof ChevronRightIcon> = {
  title: 'Shared/UI/Atoms/Icon',
  component: ChevronRightIcon,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile icon components with multiple variants, sizes, and animations. Provides common icons used throughout the application.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl', '2xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'muted', 'success', 'warning', 'destructive', 'info', 'terminal'],
    },
    animate: {
      control: 'select',
      options: ['none', 'spin', 'pulse', 'bounce'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ChevronRightIcon>;

export const ChevronRight: Story = {
  render: (args) => <ChevronRightIcon {...args} />,
  args: {},
};

export const ChevronDown: Story = {
  render: (args) => <ChevronDownIcon {...args} />,
  args: {},
};

export const Send: Story = {
  render: (args) => <SendIcon {...args} />,
  args: {},
};

export const Shield: Story = {
  render: (args) => <ShieldIcon {...args} />,
  args: {},
};

export const Loading: Story = {
  render: (args) => <LoadingIcon {...args} />,
  args: {},
};

export const Terminal: Story = {
  render: (args) => <TerminalIcon {...args} />,
  args: {},
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <ShieldIcon size="xs" />
      <ShieldIcon size="sm" />
      <ShieldIcon size="default" />
      <ShieldIcon size="lg" />
      <ShieldIcon size="xl" />
      <ShieldIcon size="2xl" />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <ShieldIcon variant="default" />
      <ShieldIcon variant="muted" />
      <ShieldIcon variant="success" />
      <ShieldIcon variant="warning" />
      <ShieldIcon variant="destructive" />
      <ShieldIcon variant="info" />
      <ShieldIcon variant="terminal" />
    </div>
  ),
};

export const Animations: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <div className="text-center">
        <LoadingIcon animate="spin" size="lg" />
        <p className="text-sm mt-2">Spin</p>
      </div>
      <div className="text-center">
        <ShieldIcon animate="pulse" size="lg" />
        <p className="text-sm mt-2">Pulse</p>
      </div>
      <div className="text-center">
        <ChevronRightIcon animate="bounce" size="lg" />
        <p className="text-sm mt-2">Bounce</p>
      </div>
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="grid grid-cols-6 gap-6 text-center">
      <div>
        <ChevronRightIcon size="xl" />
        <p className="text-sm mt-2">ChevronRight</p>
      </div>
      <div>
        <ChevronDownIcon size="xl" />
        <p className="text-sm mt-2">ChevronDown</p>
      </div>
      <div>
        <SendIcon size="xl" />
        <p className="text-sm mt-2">Send</p>
      </div>
      <div>
        <ShieldIcon size="xl" />
        <p className="text-sm mt-2">Shield</p>
      </div>
      <div>
        <LoadingIcon size="xl" />
        <p className="text-sm mt-2">Loading</p>
      </div>
      <div>
        <TerminalIcon size="xl" />
        <p className="text-sm mt-2">Terminal</p>
      </div>
    </div>
  ),
};
