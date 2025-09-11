import type { Meta, StoryObj } from '@storybook/react';
import { TerminalPrompt } from './TerminalPrompt';

const meta: Meta<typeof TerminalPrompt> = {
  title: 'Features/Terminal/Atoms/TerminalPrompt',
  component: TerminalPrompt,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable terminal prompt component displaying user@host:path format with theming support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: 'text',
    },
    host: {
      control: 'text',
    },
    path: {
      control: 'text',
    },
    showDollar: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TerminalPrompt>;

export const Default: Story = {};

export const CustomUser: Story = {
  args: {
    user: 'developer',
  },
};

export const CustomHost: Story = {
  args: {
    host: 'myserver.com',
  },
};

export const DifferentPath: Story = {
  args: {
    path: '/home/user/projects',
  },
};

export const NoDollarSign: Story = {
  args: {
    showDollar: false,
  },
};

export const RootUser: Story = {
  args: {
    user: 'root',
    host: 'production',
    path: '/',
  },
};

export const DevelopmentEnvironment: Story = {
  args: {
    user: 'dev',
    host: 'localhost',
    path: '~/workspace',
  },
};

export const VariousPrompts: Story = {
  render: () => (
    <div className="space-y-3 p-4 bg-black rounded-lg font-mono">
      <TerminalPrompt />
      <TerminalPrompt user="admin" host="server" path="/var/log" />
      <TerminalPrompt user="guest" path="/tmp" />
      <TerminalPrompt user="root" host="prod-01" path="/" />
      <TerminalPrompt showDollar={false} path="~/Documents" />
    </div>
  ),
};

export const DifferentDirectories: Story = {
  render: () => (
    <div className="space-y-2 p-4 bg-black rounded-lg font-mono">
      <TerminalPrompt path="~" />
      <TerminalPrompt path="~/projects" />
      <TerminalPrompt path="~/projects/portfolio" />
      <TerminalPrompt path="/usr/local/bin" />
      <TerminalPrompt path="/etc/nginx" />
      <TerminalPrompt path="/var/log/apache2" />
    </div>
  ),
};

export const InteractiveTerminalSession: Story = {
  render: () => (
    <div className="p-4 bg-black rounded-lg font-mono text-sm space-y-1 max-w-2xl">
      <div className="flex">
        <TerminalPrompt />
        <span className="ml-2 text-green-400">ls -la</span>
      </div>
      <div className="text-gray-300 ml-4">
        drwxr-xr-x  8 tijo tijo  256 Nov 20 14:30 .<br/>
        drwxr-xr-x 15 tijo tijo  480 Nov 20 14:29 ..<br/>
        -rw-r--r--  1 tijo tijo 1024 Nov 20 14:30 README.md
      </div>
      <div className="flex">
        <TerminalPrompt path="~/portfolio" />
        <span className="ml-2 text-green-400">npm run dev</span>
      </div>
      <div className="text-green-300 ml-4">
        {'> next dev'}<br/>
        ready - started server on http://localhost:3000
      </div>
      <div className="flex">
        <TerminalPrompt path="~/portfolio" />
        <span className="ml-2 text-white cursor-blink">_</span>
      </div>
    </div>
  ),
};

export const ThemedVariants: Story = {
  render: () => (
    <div className="space-y-6">
      {/* Terminal Theme */}
      <div className="p-4 bg-black rounded-lg">
        <h4 className="text-green-400 font-mono text-sm mb-2">Terminal Theme</h4>
        <TerminalPrompt />
      </div>
      
      {/* Light Theme */}
      <div className="p-4 bg-gray-100 rounded-lg">
        <h4 className="text-gray-800 font-mono text-sm mb-2">Light Theme</h4>
        <TerminalPrompt />
      </div>
      
      {/* Dark Theme */}
      <div className="p-4 bg-gray-900 rounded-lg">
        <h4 className="text-gray-200 font-mono text-sm mb-2">Dark Theme</h4>
        <TerminalPrompt />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Terminal prompts provide clear visual hierarchy with user, host, and path information.
        They use semantic colors to distinguish different parts of the prompt.
      </p>
      <div className="p-4 bg-black rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center">
            <TerminalPrompt />
            <span className="ml-2 text-gray-400"># This shows current user and directory</span>
          </div>
          <div className="flex items-center">
            <TerminalPrompt user="admin" host="server" path="/home/admin" />
            <span className="ml-2 text-gray-400"># Different user context</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
