import type { Meta, StoryObj } from '@storybook/react';
import { Text } from './Text';

const meta: Meta<typeof Text> = {
  title: 'Shared/UI/Atoms/Text',
  component: Text,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile text component with semantic variants and proper accessibility support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'muted', 'destructive', 'success', 'warning', 'info', 'terminal', 'accent', 'secondary'],
    },
    size: {
      control: 'select', 
      options: ['xs', 'sm', 'default', 'lg', 'xl', '2xl', '3xl', '4xl'],
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'small', 'strong', 'em'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    transform: {
      control: 'select',
      options: ['none', 'uppercase', 'lowercase', 'capitalize'],
    },
    truncate: {
      control: 'boolean',
    },
    gradient: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'Default text content',
  },
};

export const Headings: Story = {
  render: () => (
    <div className="space-y-4">
      <Text as="h1" size="4xl" weight="bold">Heading 1</Text>
      <Text as="h2" size="3xl" weight="semibold">Heading 2</Text>
      <Text as="h3" size="2xl" weight="medium">Heading 3</Text>
      <Text as="h4" size="xl" weight="medium">Heading 4</Text>
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Text variant="default">Default text styling</Text>
      <Text variant="muted">Muted text with reduced opacity</Text>
      <Text variant="success">Success text in green</Text>
      <Text variant="warning">Warning text in yellow</Text>
      <Text variant="destructive">Error text in red</Text>
      <Text variant="info">Info text in blue</Text>
      <Text variant="terminal">Terminal text with monospace font</Text>
      <Text variant="accent">Accent text</Text>
      <Text variant="secondary">Secondary text</Text>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <Text size="xs">Extra small text</Text>
      <Text size="sm">Small text</Text>
      <Text size="default">Default text</Text>
      <Text size="lg">Large text</Text>
      <Text size="xl">Extra large text</Text>
      <Text size="2xl">2XL text</Text>
      <Text size="3xl">3XL text</Text>
      <Text size="4xl">4XL text</Text>
    </div>
  ),
};

export const Weights: Story = {
  render: () => (
    <div className="space-y-2">
      <Text weight="light">Light weight text</Text>
      <Text weight="normal">Normal weight text</Text>
      <Text weight="medium">Medium weight text</Text>
      <Text weight="semibold">Semibold weight text</Text>
      <Text weight="bold">Bold weight text</Text>
    </div>
  ),
};

export const Alignment: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Text align="left">Left aligned text</Text>
      <Text align="center">Center aligned text</Text>
      <Text align="right">Right aligned text</Text>
      <Text align="justify">Justify aligned text that spans multiple lines to demonstrate the justify alignment behavior.</Text>
    </div>
  ),
};

export const Transform: Story = {
  render: () => (
    <div className="space-y-2">
      <Text transform="none">Normal Text Case</Text>
      <Text transform="uppercase">uppercase text</Text>
      <Text transform="lowercase">LOWERCASE TEXT</Text>
      <Text transform="capitalize">capitalize each word</Text>
    </div>
  ),
};

export const Truncated: Story = {
  render: () => (
    <div className="w-48 space-y-2">
      <Text>This is normal text that will wrap to multiple lines when it exceeds the container width</Text>
      <Text truncate>This is truncated text that will be cut off with ellipsis when it exceeds the container width</Text>
    </div>
  ),
};

export const Gradient: Story = {
  args: {
    children: 'Beautiful gradient text',
    gradient: true,
    size: '2xl',
    weight: 'bold',
  },
};

export const SemanticElements: Story = {
  render: () => (
    <div className="space-y-4">
      <Text as="h1" size="3xl" weight="bold">Semantic H1 heading</Text>
      <Text as="p">Semantic paragraph with default styling</Text>
      <Text as="small" size="sm" variant="muted">Small semantic element for fine print</Text>
      <Text as="strong" weight="bold">Strong semantic element for importance</Text>
      <Text as="em" className="italic">Emphasized text with semantic meaning</Text>
      <Text as="label" variant="accent">Label element for form fields</Text>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4 max-w-lg">
      <Text as="h2" size="xl" weight="semibold">Accessibility Features</Text>
      <Text variant="muted">
        This text component uses semantic HTML elements and provides proper contrast ratios for accessibility.
      </Text>
      <div className="space-y-2">
        <Text as="label" variant="accent">Form Label:</Text>
        <Text variant="success">✓ Success message with semantic color</Text>
        <Text variant="destructive">✗ Error message with clear indication</Text>
        <Text variant="warning">⚠ Warning with appropriate color contrast</Text>
      </div>
    </div>
  ),
};
