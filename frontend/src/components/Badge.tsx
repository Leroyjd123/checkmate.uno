interface BadgeProps {
  children: React.ReactNode;
  variant?: 'green' | 'blue' | 'red' | 'yellow' | 'slate';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'slate', size = 'md' }: BadgeProps) {
  const variantClasses = {
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-block rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} font-medium`}
    >
      {children}
    </span>
  );
}
