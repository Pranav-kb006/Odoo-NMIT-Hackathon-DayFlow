"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ─── Tab types ─── */
interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTab, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs[0]?.id ?? "");

  const activeContent = tabs.find((t) => t.id === activeTab)?.content;

  return (
    <div className={className}>
      {/* Tab List */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors",
              activeTab === tab.id
                ? "text-accent-700"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Panel */}
      <div className="mt-4 animate-fade-in" key={activeTab}>
        {activeContent}
      </div>
    </div>
  );
}
