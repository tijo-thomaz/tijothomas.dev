import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Shared/UI/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible input component with proper accessibility support and customizable styling.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'tel', 'url'],
    },
    placeholder: {
      control: 'text',
    },
    disabled: {
      control: 'boolean',
    },
    required: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email...',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password...',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
    defaultValue: 'This input is disabled',
  },
};

export const Required: Story = {
  args: {
    placeholder: 'Required field...',
    required: true,
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Input with default value',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <Input placeholder="Default input" />
      <Input type="email" placeholder="Email input" />
      <Input type="password" placeholder="Password input" />
      <Input type="search" placeholder="Search input" />
      <Input placeholder="Required input" required />
      <Input placeholder="Disabled input" disabled />
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <label htmlFor="accessible-input" className="block text-sm font-medium mb-2">
          Properly labeled input
        </label>
        <Input 
          id="accessible-input"
          placeholder="Type something..."
          aria-describedby="input-help"
        />
        <p id="input-help" className="text-sm text-muted-foreground mt-1">
          This input has proper ARIA attributes
        </p>
      </div>
      
      <div>
        <label htmlFor="error-input" className="block text-sm font-medium mb-2 text-red-600">
          Input with error
        </label>
        <Input 
          id="error-input"
          placeholder="Invalid input..."
          className="border-red-500 focus:ring-red-500"
          aria-invalid="true"
          aria-describedby="error-help"
        />
        <p id="error-help" className="text-sm text-red-600 mt-1">
          This field has an error
        </p>
      </div>
    </div>
  ),
};
