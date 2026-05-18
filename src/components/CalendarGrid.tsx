import React from "react";
import { motion } from "framer-motion";
import type { Laboratory } from "../types";
import { LabCard3D } from "./3d/LabCard3D";

interface CalendarGridProps {
  laboratori: Laboratory[];
}

const GIORNI = ["lun", "mar", "mer", "gio", "ven"] as const;
const NOMI_GIORNI = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({ laboratori }) => {
  return (
    <div className="py-2 overflow-x-auto custom-scrollbar">
      <div className="min-w-[800px] lg:min-w-0">
        {/* Header dei giorni */}
        <div className="grid grid-cols-5 gap-6 mb-6">
          {NOMI_GIORNI.map((giorno) => (
            <div key={giorno} className="text-center font-display font-semibold text-slate-200 glass-panel py-3 rounded-xl border-t-2 border-t-white/10">
              {giorno}
            </div>
          ))}
        </div>

        <motion.div 
          className="grid grid-cols-5 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {GIORNI.map((giorno) => {
            const labDelGiorno = laboratori.find(l => l.giorno === giorno);
            
            return (
              <motion.div key={giorno} variants={itemVariants} className="min-h-[240px]">
                {labDelGiorno ? (
                  <LabCard3D lab={labDelGiorno} />
                ) : (
                  <div className="glass-panel opacity-40 rounded-2xl h-full border border-dashed border-slate-500/40 flex items-center justify-center">
                    <span className="text-slate-400 text-sm font-medium">Libero</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
