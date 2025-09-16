import type { Meta, StoryObj } from '@storybook/react';
import VinylRecord from './VinylRecord';

const meta: Meta<typeof VinylRecord> = {
  title: 'Features/World Viewer/Atoms/VinylRecord',
  component: VinylRecord,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A vinyl record component representing different years/eras with customizable styling and animations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    year: {
      control: 'text',
    },
    company: {
      control: 'text',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: 'select',
      options: ['green', 'blue', 'purple', 'gradient'],
    },
    isActive: {
      control: 'boolean',
    },
    isAnimating: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VinylRecord>;

export const Default: Story = {
  args: {
    year: '2024',
  },
};

export const WithCompany: Story = {
  args: {
    year: '2023',
    company: 'Tech Records',
  },
};

export const Active: Story = {
  args: {
    year: '2022',
    company: 'Active Music',
    isActive: true,
  },
};

export const Animating: Story = {
  args: {
    year: '2021',
    company: 'Spinning Records',
    isAnimating: true,
  },
};

export const ActiveAndAnimating: Story = {
  args: {
    year: '2020',
    company: 'Full Motion',
    isActive: true,
    isAnimating: true,
  },
};

export const Small: Story = {
  args: {
    year: '90s',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    year: '80s',
    size: 'lg',
    company: 'Retro Records',
  },
};

export const ExtraLarge: Story = {
  args: {
    year: '70s',
    size: 'xl',
    company: 'Classic Vinyl',
  },
};

export const Blue: Story = {
  args: {
    year: '2024',
    color: 'blue',
    company: 'Blue Note',
  },
};

export const Purple: Story = {
  args: {
    year: '2024',
    color: 'purple',
    company: 'Purple Rain',
  },
};

export const Gradient: Story = {
  args: {
    year: '2024',
    color: 'gradient',
    company: 'Rainbow Records',
  },
};

export const AllColors: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-6 bg-gray-900 rounded-lg">
      <div className="text-center">
        <VinylRecord year="2024" color="green" company="Green Music" />
        <p className="text-white text-sm mt-2">Green</p>
      </div>
      <div className="text-center">
        <VinylRecord year="2023" color="blue" company="Blue Records" />
        <p className="text-white text-sm mt-2">Blue</p>
      </div>
      <div className="text-center">
        <VinylRecord year="2022" color="purple" company="Purple Label" />
        <p className="text-white text-sm mt-2">Purple</p>
      </div>
      <div className="text-center">
        <VinylRecord year="2021" color="gradient" company="Rainbow Music" />
        <p className="text-white text-sm mt-2">Gradient</p>
      </div>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-end justify-center gap-8 p-6 bg-gray-900 rounded-lg">
      <div className="text-center">
        <VinylRecord year="24" size="sm" />
        <p className="text-white text-sm mt-2">Small</p>
      </div>
      <div className="text-center">
        <VinylRecord year="23" size="md" />
        <p className="text-white text-sm mt-2">Medium</p>
      </div>
      <div className="text-center">
        <VinylRecord year="22" size="lg" />
        <p className="text-white text-sm mt-2">Large</p>
      </div>
      <div className="text-center">
        <VinylRecord year="21" size="xl" />
        <p className="text-white text-sm mt-2">Extra Large</p>
      </div>
    </div>
  ),
};

export const TimelinePage: Story = {
  render: () => (
    <div className="p-8 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg">
      <div className="text-center space-y-8">
        <h2 className="text-white text-2xl font-bold">Musical Timeline</h2>
        <div className="grid grid-cols-3 gap-6">
          <VinylRecord 
            year="70s" 
            company="Classic Rock" 
            color="gradient" 
            isActive 
          />
          <VinylRecord 
            year="80s" 
            company="New Wave" 
            color="purple" 
            isAnimating 
          />
          <VinylRecord 
            year="90s" 
            company="Grunge Era" 
            color="green" 
          />
          <VinylRecord 
            year="00s" 
            company="Pop Punk" 
            color="blue" 
          />
          <VinylRecord 
            year="10s" 
            company="EDM Rise" 
            color="gradient" 
            isAnimating 
          />
          <VinylRecord 
            year="20s" 
            company="Lo-Fi Hip Hop" 
            color="green" 
            isActive 
            isAnimating 
          />
        </div>
      </div>
    </div>
  ),
};
