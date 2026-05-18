import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Calendar, ArrowRight } from "lucide-react";
import type { Laboratory } from "../../types";
import { DAYS_ORDER, DAY_NAMES } from "./utils";
import type { DayCode } from "./utils";

interface TabCalendarioProps {
  laboratori: Laboratory[];
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  onSelectDay: (day: DayCode) => void;
}

export const TabCalendario: React.FC<TabCalendarioProps> = ({
  laboratori,
  selectedWeek,
  setSelectedWeek,
  onSelectDay,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const weeks = [1, 2, 3, 4];

  // Helper to get laboratories of a day in the selected week
  const getDayLabs = (day: DayCode) => {
    return laboratori.filter((l) => l.settimana === selectedWeek && l.giorno === day);
  };

  return (
    <div className="flex flex-col flex-grow w-full pb-20 select-none px-4 py-4 overflow-y-auto">
      {/* Week Selector Dropdown */}
      <div className="relative mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between bg-slate-800/90 border border-slate-700/80 px-5 py-3.5 rounded-xl font-bold text-[#D97706] shadow-lg active:bg-slate-800 transition-colors"
        >
          <div className="flex items-center space-x-2.5">
            <Calendar size={18} />
            <span>SETTIMANA {selectedWeek}</span>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Overlay behind dropdown to close it */}
              <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-700/85 rounded-xl shadow-2xl overflow-hidden z-20"
              >
                {weeks.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      setSelectedWeek(w);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 font-bold text-sm border-b border-slate-800/50 last:border-b-0 transition-colors ${
                      selectedWeek === w
                        ? "bg-[#D97706]/15 text-[#D97706]"
                        : "text-slate-300 active:bg-slate-800"
                    }`}
                  >
                    Settimana {w}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Daily Cards Timeline */}
      <div className="space-y-4">
        {DAYS_ORDER.map((day) => {
          const labs = getDayLabs(day);
          const hasLabs = labs.length > 0;
          
          // Identify first (principal) lab
          const mainLab = labs[0];
          const hasMore = labs.length > 1;

          // Determine fasce present for styling
          const fasce = new Set(labs.map((l) => l.fascia));
          const hasElementari = fasce.has("elementari");
          const hasMedie = fasce.has("medie");

          // Render border band dynamically
          let stripeClass = "bg-slate-600";
          if (hasElementari && hasMedie) {
            stripeClass = "bg-gradient-to-b from-amber-500 to-blue-500";
          } else if (hasElementari) {
            stripeClass = "bg-amber-500";
          } else if (hasMedie) {
            stripeClass = "bg-blue-600";
          }

          return (
            <motion.div
              key={day}
              whileTap={hasLabs ? { scale: 0.98 } : {}}
              onClick={() => hasLabs && onSelectDay(day)}
              className={`bg-slate-800/90 rounded-2xl border border-slate-700/50 shadow-md relative overflow-hidden flex min-h-[76px] transition-all ${
                hasLabs ? "active:border-[#D97706]/30 cursor-pointer" : "opacity-60 cursor-not-allowed"
              }`}
            >
              {/* Left Accent Stripe */}
              <div className={`w-2 shrink-0 ${stripeClass}`} />

              {/* Main Card Content */}
              <div className="flex-grow flex items-center justify-between px-4 py-3">
                <div className="flex flex-col justify-center">
                  <span className="text-white text-base font-black uppercase tracking-wider">
                    {DAY_NAMES[day]}
                  </span>
                  
                  {hasLabs && mainLab ? (
                    <div className="mt-1 flex flex-col">
                      <span className={`text-sm font-semibold truncate max-w-[200px] ${
                        mainLab.categoria === 'Art & Craft' ? 'text-amber-400' :
                        mainLab.categoria === 'Sport/Gioco' ? 'text-emerald-400' :
                        mainLab.categoria === 'Cucina' ? 'text-rose-400' : 'text-slate-300'
                      }`}>
                        {mainLab.nome}
                      </span>
                      {hasMore && (
                        <span className="text-slate-400 text-xs mt-0.5 font-medium">
                          + altri {labs.length - 1} laboratori
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500 text-xs italic mt-0.5">
                      Nessuna attività programmata
                    </span>
                  )}
                </div>

                {/* Right Arrow Navigation Indicator */}
                {hasLabs && (
                  <div className="text-slate-500 active:text-[#D97706] p-1.5 rounded-full bg-slate-700/30">
                    <ArrowRight size={18} className="text-[#D97706]" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
