import type { Meta, StoryObj } from '@storybook/react';
import { CommandButton } from './CommandButton';

const meta: Meta<typeof CommandButton> = {
  title: 'Widgets/Command Suggestions/Atoms/CommandButton',
  component: CommandButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A button component for terminal command suggestions with consistent theming and icons.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    command: {
      control: 'text',
    },
    icon: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof CommandButton>;

export const Default: Story = {
  args: {
    command: 'ls',
    icon: '📁',
    description: 'List directory contents',
    onClick: () => {},
  },
};

export const Help: Story = {
  args: {
    command: 'help',
    icon: '❓',
    description: 'Show available commands',
    onClick: () => {},
  },
};

export const Clear: Story = {
  args: {
    command: 'clear',
    icon: '🧹',
    description: 'Clear the terminal screen',
    onClick: () => {},
  },
};

export const Projects: Story = {
  args: {
    command: 'projects',
    icon: '💼',
    description: 'Show portfolio projects',
    onClick: () => {},
  },
};

export const Resume: Story = {
  args: {
    command: 'resume',
    icon: '📄',
    description: 'Download resume PDF',
    onClick: () => {},
  },
};

export const CommonCommands: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <h4 className="text-sm font-medium text-gray-700">Common Commands</h4>
      <div className="space-y-2">
        <CommandButton 
          command="help" 
          icon="❓"
          description="Show available commands"
          onClick={() => alert('help')}
        />
        <CommandButton 
          command="about" 
          icon="👤"
          description="Learn about Tijo"
          onClick={() => alert('about')}
        />
        <CommandButton 
          command="projects" 
          icon="💼"
          description="View portfolio projects"
          onClick={() => alert('projects')}
        />
        <CommandButton 
          command="contact" 
          icon="📧"
          description="Get contact information"
          onClick={() => alert('contact')}
        />
        <CommandButton 
          command="resume" 
          icon="📄"
          description="Download resume PDF"
          onClick={() => alert('resume')}
        />
      </div>
    </div>
  ),
};

export const SystemCommands: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <h4 className="text-sm font-medium text-gray-700">System Commands</h4>
      <div className="space-y-2">
        <CommandButton 
          command="clear" 
          icon="🧹"
          description="Clear terminal screen"
          onClick={() => alert('clear')}
        />
        <CommandButton 
          command="history" 
          icon="📜"
          description="Show command history"
          onClick={() => alert('history')}
        />
        <CommandButton 
          command="pwd" 
          icon="📍"
          description="Print working directory"
          onClick={() => alert('pwd')}
        />
        <CommandButton 
          command="whoami" 
          icon="🤔"
          description="Display current user"
          onClick={() => alert('whoami')}
        />
        <CommandButton 
          command="date" 
          icon="📅"
          description="Show current date and time"
          onClick={() => alert('date')}
        />
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Command buttons provide clear descriptions and are keyboard accessible.
        They help users discover available terminal commands.
      </p>
      <div className="space-y-2">
        <CommandButton 
          command="ls -la" 
          icon="📁"
          description="List all files with detailed information (keyboard accessible)"
          onClick={() => alert('Executing: ls -la')}
        />
        <CommandButton 
          command="cat README.md" 
          icon="📖"
          description="Display the contents of README file"
          onClick={() => alert('Executing: cat README.md')}
        />
      </div>
      <p className="text-xs text-gray-500">
        Screen readers will announce both the command and its description.
        Tab navigation allows keyboard-only interaction.
      </p>
    </div>
  ),
};
