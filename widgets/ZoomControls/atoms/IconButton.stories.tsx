import type { Meta, StoryObj } from '@storybook/react';
import { IconButton } from './IconButton';
import { Plus, Minus, RotateCcw, ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';

const meta: Meta<typeof IconButton> = {
  title: 'Widgets/Zoom Controls/Atoms/IconButton',
  component: IconButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A small themed icon button for zoom controls and similar compact interfaces.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const ZoomInButton: Story = {
  args: {
    icon: <ZoomIn className="h-3 w-3" />,
    title: 'Zoom in',
    onClick: () => {},
  },
};

export const ZoomOutButton: Story = {
  args: {
    icon: <ZoomOut className="h-3 w-3" />,
    title: 'Zoom out',
    onClick: () => {},
  },
};

export const PlusButton: Story = {
  args: {
    icon: <Plus className="h-3 w-3" />,
    title: 'Increase',
    onClick: () => {},
  },
};

export const MinusButton: Story = {
  args: {
    icon: <Minus className="h-3 w-3" />,
    title: 'Decrease',
    onClick: () => {},
  },
};

export const ResetButton: Story = {
  args: {
    icon: <RotateCcw className="h-3 w-3" />,
    title: 'Reset to default',
    onClick: () => {},
  },
};

export const Disabled: Story = {
  args: {
    icon: <Plus className="h-3 w-3" />,
    title: 'Cannot increase further',
    disabled: true,
    onClick: () => {},
  },
};

export const ZoomControls: Story = {
  render: () => (
    <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
      <IconButton 
        icon={<ZoomOut className="h-3 w-3" />}
        title="Zoom out"
        onClick={() => alert('Zoomed out')}
      />
      <span className="text-sm font-mono px-2">100%</span>
      <IconButton 
        icon={<ZoomIn className="h-3 w-3" />}
        title="Zoom in"
        onClick={() => alert('Zoomed in')}
      />
      <IconButton 
        icon={<RotateCcw className="h-3 w-3" />}
        title="Reset zoom"
        onClick={() => alert('Reset zoom')}
      />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Normal</h4>
        <div className="flex gap-2">
          <IconButton 
            icon={<Plus className="h-3 w-3" />}
            title="Add"
            onClick={() => {}}
          />
          <IconButton 
            icon={<Minus className="h-3 w-3" />}
            title="Remove"
            onClick={() => {}}
          />
          <IconButton 
            icon={<Maximize className="h-3 w-3" />}
            title="Maximize"
            onClick={() => {}}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Disabled</h4>
        <div className="flex gap-2">
          <IconButton 
            icon={<Plus className="h-3 w-3" />}
            title="Add (disabled)"
            disabled
            onClick={() => {}}
          />
          <IconButton 
            icon={<Minus className="h-3 w-3" />}
            title="Remove (disabled)"
            disabled
            onClick={() => {}}
          />
          <IconButton 
            icon={<Maximize className="h-3 w-3" />}
            title="Maximize (disabled)"
            disabled
            onClick={() => {}}
          />
        </div>
      </div>
    </div>
  ),
};

export const InteractiveExample: Story = {
  render: () => {
    let count = 5;
    const minValue = 0;
    const maxValue = 10;
    
    return (
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">Count: <span className="font-mono font-bold">{count}</span></p>
          <div className="flex items-center justify-center gap-2">
            <IconButton 
              icon={<Minus className="h-3 w-3" />}
              title="Decrease count"
              disabled={count <= minValue}
              onClick={() => {
                if (count > minValue) {
                  count--;
                  alert(`Count: ${count}`);
                }
              }}
            />
            <IconButton 
              icon={<RotateCcw className="h-3 w-3" />}
              title="Reset count"
              onClick={() => {
                count = 5;
                alert('Count reset to 5');
              }}
            />
            <IconButton 
              icon={<Plus className="h-3 w-3" />}
              title="Increase count"
              disabled={count >= maxValue}
              onClick={() => {
                if (count < maxValue) {
                  count++;
                  alert(`Count: ${count}`);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const DifferentIcons: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-3">
      <div className="text-center">
        <IconButton 
          icon={<Plus className="h-3 w-3" />}
          title="Plus"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Plus</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<Minus className="h-3 w-3" />}
          title="Minus"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Minus</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<ZoomIn className="h-3 w-3" />}
          title="Zoom In"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Zoom In</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<ZoomOut className="h-3 w-3" />}
          title="Zoom Out"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Zoom Out</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<RotateCcw className="h-3 w-3" />}
          title="Reset"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Reset</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<Maximize className="h-3 w-3" />}
          title="Maximize"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Maximize</p>
      </div>
      <div className="text-center">
        <IconButton 
          icon={<Minimize className="h-3 w-3" />}
          title="Minimize"
          onClick={() => {}}
        />
        <p className="text-xs mt-1">Minimize</p>
      </div>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Icon buttons provide proper titles for screen readers and are keyboard accessible.
        Try tabbing to the buttons and using Enter or Space to activate them.
      </p>
      <div className="flex gap-2">
        <IconButton 
          icon={<Plus className="h-3 w-3" />}
          title="Increase text size (keyboard accessible)"
          onClick={() => alert('Text size increased!')}
        />
        <IconButton 
          icon={<Minus className="h-3 w-3" />}
          title="Decrease text size (keyboard accessible)"
          onClick={() => alert('Text size decreased!')}
        />
        <IconButton 
          icon={<RotateCcw className="h-3 w-3" />}
          title="Reset text size to default"
          onClick={() => alert('Text size reset!')}
        />
      </div>
      <p className="text-xs text-gray-500">
        Screen readers will announce the title when buttons are focused.
        Disabled buttons will be announced as "unavailable".
      </p>
    </div>
  ),
};
