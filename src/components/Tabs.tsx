import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export type TabType = "elementari" | "medie" | "materiali";

interface TabsProps {
  activeTab: TabType;
  onChange: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onChange }) => {
  const tabs: { id: TabType; label: string }[] = [
    { id: "elementari", label: "Elementari (LUN-VEN)" },
    { id: "medie", label: "Medie (LUN-VEN)" },
    { id: "materiali", label: "Lista Materiali Completa" },
  ];

  return (
    <div className="glass-panel border-x-0 border-t-0 border-b border-white/10 relative z-20 sticky top-0 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto custom-scrollbar" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={clsx(
                  "relative whitespace-nowrap py-4 px-2 text-sm font-medium transition-colors duration-200 outline-none",
                  isActive ? "text-white font-bold" : "text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-secondary shadow-[0_0_10px_rgba(217,119,6,0.8)] rounded-t-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
