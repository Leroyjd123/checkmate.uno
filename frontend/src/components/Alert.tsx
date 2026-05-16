interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', title, children, onClose }: AlertProps) {
  const variantClasses = {
    success: 'bg-green-500/10 border-green-500/30 text-green-300',
    error: 'bg-red-500/10 border-red-500/30 text-red-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
  };

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ',
  };

  return (
    <div className={`border rounded-lg p-4 ${variantClasses[variant]}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg font-bold">{iconMap[variant]}</span>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          <p className="text-sm">{children}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
