interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-white">{label}</label>}
      <input
        className={`
          px-4 py-2 rounded-lg border border-slate-700
          bg-slate-900 text-white
          placeholder-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-sm text-red-400">{error}</span>}
    </div>
  );
}
