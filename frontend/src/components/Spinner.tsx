interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'green' | 'blue' | 'red' | 'yellow';
}

export function Spinner({ size = 'md', color = 'green' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    green: 'border-green-500',
    blue: 'border-blue-500',
    red: 'border-red-500',
    yellow: 'border-yellow-500',
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 border-slate-700 rounded-full animate-spin ${colorClasses[color]}`}
      style={{
        borderTopColor: `var(--color-${color})`,
      }}
    />
  );
}
