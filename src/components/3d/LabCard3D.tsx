import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Laboratory } from "../../types";
import { Tag } from "lucide-react";
import clsx from "clsx";
import confetti from "canvas-confetti";

interface LabCardProps {
  lab: Laboratory;
}

export const LabCard3D: React.FC<LabCardProps> = ({ lab }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (!isFlipped) {
      // Confetti physics on open
      const colors = [getCategoryHex(lab.categoria), "#ffffff"];
      confetti({
        particleCount: 40,
        spread: 60,
        colors,
        origin: { y: 0.7 },
        disableForReducedMotion: true,
      });
    }
    setIsFlipped(!isFlipped);
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "art & craft": return "border-t-secondary";
      case "sport/gioco": return "border-t-tertiary";
      case "cucina": return "border-t-error";
      default: return "border-t-primary";
    }
  };

  const getCategoryHex = (category: string) => {
    switch (category.toLowerCase()) {
      case "art & craft": return "#D97706";
      case "sport/gioco": return "#10B981";
      case "cucina": return "#EF4444";
      default: return "#1E3A8A";
    }
  };

  return (
    <div className="relative w-full h-[240px] perspective-1000 cursor-pointer group" onClick={handleFlip}>
      <motion.div
        className="w-full h-full preserve-3d"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ y: -8, scale: 1.02 }}
      >
        {/* FRONT */}
        <div className={clsx(
          "absolute inset-0 backface-hidden rounded-2xl glass-panel flex flex-col p-6 border-t-[3px]",
          "transition-all duration-300 group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.3)]",
          getCategoryColor(lab.categoria)
        )}>
           <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-300">
            {lab.categoria}
          </div>
          <h3 className="text-xl font-display font-bold mb-3 line-clamp-3 text-white">
            {lab.nome}
          </h3>
          <div className="mt-auto flex items-center text-sm text-slate-400">
            <Tag className="w-4 h-4 mr-2" />
            <span>{lab.materiali.length} Materiali</span>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 backface-hidden rounded-2xl glass-panel-heavy p-6 rotate-y-180 overflow-y-auto custom-scrollbar flex flex-col">
          <h4 className="font-bold text-sm mb-2 text-white/90 font-display">Descrizione</h4>
          <p className="text-sm text-slate-300 mb-4">{lab.descrizione}</p>
          
          <h4 className="font-bold text-sm mb-2 text-white/90 font-display">Materiali Necessari</h4>
          {lab.materiali.length > 0 ? (
            <ul className="text-sm text-slate-300 space-y-1 pl-4 list-disc mb-2">
              {lab.materiali.map((mat, i) => <li key={i}>{mat}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-slate-400 italic">Nessun materiale</p>
          )}
          
          <div className="mt-auto text-center pt-2">
            <span className="text-xs text-slate-500 uppercase tracking-widest">Click per chiudere</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
