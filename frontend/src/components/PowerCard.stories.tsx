import type { Meta, StoryObj } from '@storybook/react';
import { PowerCard } from './PowerCard';
import { PowerCard as PowerCardType } from '@/types/game';

const meta = {
  title: 'Components/PowerCard',
  component: PowerCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PowerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const createCard = (type: PowerCardType['type']): PowerCardType => ({
  id: '1',
  type,
  usedAt: null,
});

export const SkipTurn: Story = {
  args: {
    card: createCard('skip_turn'),
  },
};

export const ReverseMove: Story = {
  args: {
    card: createCard('reverse_move'),
  },
};

export const ExtraMove: Story = {
  args: {
    card: createCard('extra_move'),
  },
};

export const Teleport: Story = {
  args: {
    card: createCard('teleport'),
  },
};

export const Shield: Story = {
  args: {
    card: createCard('shield'),
  },
};

export const Sacrifice: Story = {
  args: {
    card: createCard('sacrifice'),
  },
};

export const WildSwap: Story = {
  args: {
    card: createCard('wild_swap'),
  },
};

export const Freeze: Story = {
  args: {
    card: createCard('freeze'),
  },
};

export const Disabled: Story = {
  args: {
    card: createCard('skip_turn'),
    disabled: true,
  },
};

export const AllCards: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap justify-center p-8">
      <PowerCard card={createCard('skip_turn')} />
      <PowerCard card={createCard('reverse_move')} />
      <PowerCard card={createCard('extra_move')} />
      <PowerCard card={createCard('teleport')} />
      <PowerCard card={createCard('shield')} />
      <PowerCard card={createCard('sacrifice')} />
      <PowerCard card={createCard('wild_swap')} />
      <PowerCard card={createCard('freeze')} />
    </div>
  ),
};
