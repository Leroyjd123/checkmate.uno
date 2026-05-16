import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="flex border-b border-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`px-4 py-2 font-medium transition-colors ${
              active === tab.id
                ? 'border-b-2 border-green-500 text-green-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="py-4">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  );
}
