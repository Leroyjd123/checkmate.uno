import type { Meta, StoryObj } from '@storybook/react';
import { Spinner } from './Spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = {
  args: { size: 'sm' },
};

export const Medium: Story = {
  args: { size: 'md' },
};

export const Large: Story = {
  args: { size: 'lg' },
};

export const Green: Story = {
  args: { size: 'md', color: 'green' },
};

export const Blue: Story = {
  args: { size: 'md', color: 'blue' },
};

export const Red: Story = {
  args: { size: 'md', color: 'red' },
};

export const Yellow: Story = {
  args: { size: 'md', color: 'yellow' },
};

export const AllSizes: Story = {
  args: { size: 'md' },
  render: () => (
    <div className="flex gap-8">
      <div className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-sm text-slate-400">Small</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="md" />
        <span className="text-sm text-slate-400">Medium</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-sm text-slate-400">Large</span>
      </div>
    </div>
  ),
};
