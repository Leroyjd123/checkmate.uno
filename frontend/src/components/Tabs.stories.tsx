import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultTabs = [
  {
    id: 'rules',
    label: 'Rules',
    content: <div className="text-slate-300">Learn the basic chess rules and how to play.</div>,
  },
  {
    id: 'cards',
    label: 'Power Cards',
    content: <div className="text-slate-300">Discover all 8 unique power cards and their effects.</div>,
  },
  {
    id: 'strategy',
    label: 'Strategy',
    content: <div className="text-slate-300">Master advanced tactics and game strategies.</div>,
  },
];

export const Default: Story = {
  args: {
    tabs: defaultTabs,
  },
};

export const TwoTabs: Story = {
  args: {
    tabs: [
      {
        id: 'local',
        label: 'Local Game',
        content: <div className="text-slate-300">Play with a friend on the same device.</div>,
      },
      {
        id: 'online',
        label: 'Online Game',
        content: <div className="text-slate-300">Play with friends worldwide in real-time.</div>,
      },
    ],
  },
};

export const WithCustomDefault: Story = {
  args: {
    tabs: defaultTabs,
    defaultTab: 'cards',
  },
};
