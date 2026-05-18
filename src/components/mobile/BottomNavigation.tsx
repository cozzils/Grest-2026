import React from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, ClipboardCheck } from "lucide-react";

export type MobileTab = "oggi" | "calendario" | "materiali";

interface BottomNavigationProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onChange }) => {
  const tabs = [
    { id: "oggi" as const, label: "Oggi", icon: Calendar },
    { id: "calendario" as const, label: "Calendario", icon: CalendarDays },
    { id: "materiali" as const, label: "Materiali", icon: ClipboardCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#1E3A8A] border-t border-[#D97706]/15 h-[64px] flex items-center justify-around shadow-[0_-4px_12px_rgba(0,0,0,0.15)] pb-safe">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className="relative flex flex-col items-center justify-center w-full h-full text-slate-300 focus:outline-none transition-colors duration-200"
            style={{ minHeight: "48px" }}
            aria-label={tab.label}
          >
            <div className="relative z-10 flex flex-col items-center justify-center">
              <Icon
                size={22}
                className={`transition-colors duration-300 ${
                  isActive ? "text-[#D97706]" : "text-slate-300"
                }`}
              />
              <span
                className={`text-[10px] font-medium mt-1 transition-colors duration-300 ${
                  isActive ? "text-[#D97706]" : "text-slate-400"
                }`}
              >
                {tab.label}
              </span>
            </div>

            {/* Active underline indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#D97706] rounded-t-full mx-6"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};
