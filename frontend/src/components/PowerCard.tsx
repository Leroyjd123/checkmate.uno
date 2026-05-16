import { PowerCard as PowerCardType } from '@/types/game';

interface PowerCardProps {
  card: PowerCardType;
  onClick?: () => void;
  disabled?: boolean;
}

const cardColors: Record<string, string> = {
  skip_turn: 'bg-green-500/20 dark:bg-green-500/20 border-green-500/50 dark:border-green-500/50 text-green-400',
  reverse_move: 'bg-red-500/20 dark:bg-red-500/20 border-red-500/50 dark:border-red-500/50 text-red-400',
  extra_move: 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500/50 dark:border-blue-500/50 text-blue-400',
  teleport: 'bg-yellow-500/20 dark:bg-yellow-500/20 border-yellow-500/50 dark:border-yellow-500/50 text-yellow-400',
  shield: 'bg-green-500/20 dark:bg-green-500/20 border-green-500/50 dark:border-green-500/50 text-green-400',
  sacrifice: 'bg-red-500/20 dark:bg-red-500/20 border-red-500/50 dark:border-red-500/50 text-red-400',
  wild_swap: 'bg-blue-500/20 dark:bg-blue-500/20 border-blue-500/50 dark:border-blue-500/50 text-blue-400',
  freeze: 'bg-yellow-500/20 dark:bg-yellow-500/20 border-yellow-500/50 dark:border-yellow-500/50 text-yellow-400',
};

const cardNames: Record<string, string> = {
  skip_turn: 'Skip Turn',
  reverse_move: 'Reverse Move',
  extra_move: 'Extra Move',
  teleport: 'Teleport',
  shield: 'Shield',
  sacrifice: 'Sacrifice',
  wild_swap: 'Wild Swap',
  freeze: 'Freeze',
};

export function PowerCard({ card, onClick, disabled = false }: PowerCardProps) {
  const colorClass = cardColors[card.card_type] || 'bg-slate-700 border-slate-600 text-slate-300';
  const name = cardNames[card.card_type] || 'Unknown Card';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${colorClass}
        border-2 rounded-xl p-4 min-w-28 h-32
        flex flex-col items-center justify-center text-center
        font-semibold text-sm
        transition-all duration-200
        hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <div className="text-xs uppercase tracking-wide mb-2 opacity-80">Card</div>
      <div className="font-bold text-base">{name}</div>
      <div className="text-xs mt-2 opacity-70">Click to use</div>
    </button>
  );
}
