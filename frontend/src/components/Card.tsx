interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>}
      {children}
    </div>
  );
}
