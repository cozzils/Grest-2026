import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Laboratory } from "../../types";
import { MobileHeader } from "./MobileHeader";
import { BottomNavigation } from "./BottomNavigation";
import type { MobileTab } from "./BottomNavigation";
import { TabOggi } from "./TabOggi";
import { TabCalendario } from "./TabCalendario";
import { TabMateriali } from "./TabMateriali";
import type { DayCode } from "./utils";

interface MobileAppProps {
  laboratori: Laboratory[];
  loading: boolean;
}

const getTodayDayCode = (): DayCode => {
  const days: DayCode[] = ["lun", "mar", "mer", "gio", "ven"];
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  if (dayIndex >= 1 && dayIndex <= 5) {
    return days[dayIndex - 1];
  }
  return "lun";
};

export const MobileApp: React.FC<MobileAppProps> = ({ laboratori, loading }) => {
  const [activeTab, setActiveTab] = useState<MobileTab>("oggi");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [activeDay, setActiveDay] = useState<DayCode>("lun");

  // Determine current day of week on mount
  useEffect(() => {
    setActiveDay(getTodayDayCode());
  }, []);

  const handleSelectDayFromCalendar = (day: DayCode) => {
    setActiveDay(day);
    setActiveTab("oggi");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-slate-900 overflow-hidden text-slate-100 relative">
      {/* Fixed Sticky Header */}
      <MobileHeader />

      {/* Main Content Viewport */}
      <main className="flex-grow w-full overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-grow flex flex-col justify-center items-center">
            <div className="w-10 h-10 border-4 border-[#D97706] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-slate-400 text-xs font-semibold mt-4">
              Caricamento attività...
            </span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "oggi" && (
              <motion.div
                key="oggi"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-grow flex flex-col overflow-hidden w-full"
              >
                <TabOggi
                  laboratori={laboratori}
                  selectedWeek={selectedWeek}
                  activeDay={activeDay}
                  setActiveDay={setActiveDay}
                />
              </motion.div>
            )}

            {activeTab === "calendario" && (
              <motion.div
                key="calendario"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-grow flex flex-col overflow-hidden w-full"
              >
                <TabCalendario
                  laboratori={laboratori}
                  selectedWeek={selectedWeek}
                  setSelectedWeek={setSelectedWeek}
                  onSelectDay={handleSelectDayFromCalendar}
                />
              </motion.div>
            )}

            {activeTab === "materiali" && (
              <motion.div
                key="materiali"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex-grow flex flex-col overflow-hidden w-full"
              >
                <TabMateriali laboratori={laboratori} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Fixed Bottom Tab Navigation */}
      <BottomNavigation activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
};
