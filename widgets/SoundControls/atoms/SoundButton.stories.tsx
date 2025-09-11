import type { Meta, StoryObj } from '@storybook/react';
import { SoundButton } from './SoundButton';
import { Volume2, VolumeX, Play as PlayIcon, Pause as PauseIcon } from 'lucide-react';

const meta: Meta<typeof SoundButton> = {
  title: 'Widgets/Sound Controls/Atoms/SoundButton',
  component: SoundButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A themed sound control button with consistent styling and theming support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
    },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof SoundButton>;

export const VolumeOn: Story = {
  args: {
    title: 'Turn sound on',
    children: <Volume2 className="h-4 w-4" />,
    onClick: () => {},
  },
};

export const VolumeOff: Story = {
  args: {
    title: 'Turn sound off',
    children: <VolumeX className="h-4 w-4" />,
    onClick: () => {},
  },
};

export const PlayButton: Story = {
  args: {
    title: 'Play sound',
    children: <PlayIcon className="h-4 w-4" />,
    onClick: () => {},
  },
};

export const PauseButton: Story = {
  args: {
    title: 'Pause sound',
    children: <PauseIcon className="h-4 w-4" />,
    onClick: () => {},
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex gap-3 items-center">
      <SoundButton title="Volume On" onClick={() => alert('Volume On')}>
        <Volume2 className="h-4 w-4" />
      </SoundButton>
      <SoundButton title="Volume Off" onClick={() => alert('Volume Off')}>
        <VolumeX className="h-4 w-4" />
      </SoundButton>
      <SoundButton title="Play" onClick={() => alert('Play')}>
        <PlayIcon className="h-4 w-4" />
      </SoundButton>
      <SoundButton title="Pause" onClick={() => alert('Pause')}>
        <PauseIcon className="h-4 w-4" />
      </SoundButton>
    </div>
  ),
};

export const AccessibilityDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Sound buttons have proper titles for screen readers and are keyboard accessible.
        Try tabbing to the buttons and pressing Enter or Space.
      </p>
      <div className="flex gap-3">
        <SoundButton 
          title="Toggle background music (currently off)"
          onClick={() => alert('Background music toggled')}
        >
          <VolumeX className="h-4 w-4" />
        </SoundButton>
        <SoundButton 
          title="Play notification sound"
          onClick={() => alert('Notification sound played')}
        >
          <PlayIcon className="h-4 w-4" />
        </SoundButton>
      </div>
      <p className="text-xs text-gray-500">
        Screen readers will announce the title attribute when buttons are focused.
      </p>
    </div>
  ),
};
