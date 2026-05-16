import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Green: Story = {
  args: { children: 'Success', variant: 'green' },
};

export const Blue: Story = {
  args: { children: 'Info', variant: 'blue' },
};

export const Red: Story = {
  args: { children: 'Error', variant: 'red' },
};

export const Yellow: Story = {
  args: { children: 'Warning', variant: 'yellow' },
};

export const Slate: Story = {
  args: { children: 'Default', variant: 'slate' },
};

export const Small: Story = {
  args: { children: 'Small Badge', variant: 'green', size: 'sm' },
};

export const Medium: Story = {
  args: { children: 'Medium Badge', variant: 'green', size: 'md' },
};

export const AllVariants: Story = {
  args: { children: 'Badge' },
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <Badge variant="green">Green</Badge>
      <Badge variant="blue">Blue</Badge>
      <Badge variant="red">Red</Badge>
      <Badge variant="yellow">Yellow</Badge>
      <Badge variant="slate">Slate</Badge>
    </div>
  ),
};
