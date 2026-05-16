import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    children: 'This is a simple card with content.',
  },
};

export const WithTitle: Story = {
  args: {
    title: 'Card Title',
    children: 'This card has a title and some content inside.',
  },
};

export const WithLongContent: Story = {
  args: {
    title: 'Game Statistics',
    children: (
      <div className="space-y-2">
        <p>Win Rate: 65%</p>
        <p>Total Games: 42</p>
        <p>Current Streak: 5 wins</p>
      </div>
    ),
  },
};

export const CustomWidth: Story = {
  args: {
    title: 'Player Info',
    className: 'w-80',
    children: 'This card has custom width styling.',
  },
};
