import React from "react";
import { motion } from "framer-motion";
import { Calendar, CalendarDays, ClipboardCheck } from "lucide-react";

export type MobileTab = "oggi" | "calendario" | "materiali";

interface BottomNavigationProps {
  activeTab: MobileTab;
  onChange: (tab: MobileTab) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChange,
}) => {
  const tabs = [
    { id: "oggi" as const, label: "Oggi", icon: Calendar },
    { id: "calendario" as const, label: "Calendario", icon: CalendarDays },
    { id: "materiali" as const, label: "Materiali", icon: ClipboardCheck },
  ];

  return (
    /* Floating pill wrapper */
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-0 pointer-events-none">
      <motion.nav
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 28, delay: 0.1 }}
        className="pointer-events-auto flex items-center justify-around h-[60px] rounded-2xl border border-white/10"
        style={{
          background: "rgba(2, 6, 23, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 -4px 20px rgba(217,119,6,0.12), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="relative flex flex-col items-center justify-center w-full h-full focus:outline-none"
              style={{ minHeight: "48px" }}
              aria-label={tab.label}
            >
              {/* Active pill background */}
              {isActive && (
                <motion.div
                  layoutId="activeNavPill"
                  className="absolute inset-x-2 inset-y-1.5 rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(217,119,6,0.18) 0%, rgba(217,119,6,0.08) 100%)",
                    border: "1px solid rgba(217,119,6,0.25)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center justify-center">
                <Icon
                  size={20}
                  className="transition-colors duration-300"
                  style={{
                    color: isActive ? "#D97706" : "rgba(148,163,184,0.7)",
                  }}
                />
                <span
                  className="text-[10px] font-semibold mt-1 transition-colors duration-300"
                  style={{
                    color: isActive ? "#D97706" : "rgba(100,116,139,0.8)",
                  }}
                >
                  {tab.label}
                </span>
              </div>
            </motion.button>
          );
        })}
      </motion.nav>
    </div>
  );
};
