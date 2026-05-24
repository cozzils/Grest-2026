import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Printer, RotateCcw, AlertTriangle, Sparkles } from "lucide-react";
import type { Laboratory } from "../../types";
import { aggregateAllMaterials, getCheckedMaterials, saveCheckedMaterials } from "./utils";
import type { MaterialItem } from "./utils";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";

interface TabMaterialiProps {
  laboratori: Laboratory[];
}

export const TabMateriali: React.FC<TabMaterialiProps> = ({ laboratori }) => {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Initialize and load materials
  const loadMaterials = () => {
    const list = aggregateAllMaterials(laboratori);
    setMaterials(list);

    // Open all accordions by default if first load
    if (Object.keys(openAccordions).length === 0 && list.length > 0) {
      const uniqueCats = Array.from(new Set(list.map((m) => m.category)));
      const initialOpenState: Record<string, boolean> = {};
      uniqueCats.forEach((cat) => {
        initialOpenState[cat] = true;
      });
      setOpenAccordions(initialOpenState);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [laboratori]);

  const handleToggleCheckbox = (id: string) => {
    const checkedMap = getCheckedMaterials();
    const newChecked = !checkedMap[id];
    
    const updatedMap = { ...checkedMap, [id]: newChecked };
    saveCheckedMaterials(updatedMap);
    
    // Update local state
    setMaterials((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: newChecked } : item))
    );
  };

  const handleResetSpunte = () => {
    saveCheckedMaterials({});
    setMaterials((prev) => prev.map((item) => ({ ...item, checked: false })));
    setShowResetConfirm(false);
  };

  const handleToggleAccordion = (category: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleExportList = async () => {
    if (!printAreaRef.current) return;
    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#1e293b",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Materiali_GREST_Completi.png`;
      link.click();
    } catch (e) {
      console.error("Error exporting materials", e);
    }
  };

  // Group materials by category
  const categoriesMap = new Map<string, MaterialItem[]>();
  materials.forEach((m) => {
    if (!categoriesMap.has(m.category)) {
      categoriesMap.set(m.category, []);
    }
    categoriesMap.get(m.category)!.push(m);
  });

  const totalCount = materials.length;
  const readyCount = materials.filter((m) => m.checked).length;
  const progressPercent = totalCount > 0 ? (readyCount / totalCount) * 100 : 0;
  const isComplete = totalCount > 0 && readyCount === totalCount;

  // Fire confetti when all materials are ready
  const prevCompleteRef = useRef(false);
  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      // Big celebration!
      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...opts,
          origin: { y: 0.7 },
          particleCount: Math.floor(200 * particleRatio),
          zIndex: 9999,
        });
      };
      fire(0.25, { spread: 26, startVelocity: 55, colors: ["#D97706", "#FCD34D"] });
      fire(0.2, { spread: 60, colors: ["#10B981", "#34D399"] });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#8B5CF6", "#A78BFA"] });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2, colors: ["#FCD34D", "#D97706"] });
      fire(0.1, { spread: 120, startVelocity: 45, colors: ["#10B981", "#D97706"] });
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete]);

  return (
    <div className="flex flex-col flex-grow w-full pb-20 select-none px-4 py-4 overflow-y-auto">
      {/* Target for screenshot export */}
      <div ref={printAreaRef} className="space-y-4">
        {/* Header and Progress Bar */}
        <motion.div
          className="rounded-2xl p-5 border shadow-md relative overflow-hidden"
          animate={{
            borderColor: isComplete ? "rgba(16,185,129,0.4)" : "rgba(51,65,85,0.5)",
            background: isComplete
              ? "rgba(16,185,129,0.08)"
              : "rgba(30,41,59,0.9)",
          }}
          transition={{ duration: 0.5 }}
        >
          {/* Celebration glow when complete */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.15) 0%, transparent 70%)",
              }}
            />
          )}

          <div className="flex items-center space-x-2">
            <h2 className="text-white text-lg font-black uppercase tracking-wider">
              Materiali Completi
            </h2>
            {isComplete && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Sparkles size={20} className="text-emerald-400" />
              </motion.div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2.5">
            <motion.span
              className="text-sm font-bold"
              animate={{ color: isComplete ? "#10b981" : "#D97706" }}
              transition={{ duration: 0.4 }}
            >
              ✓ {readyCount}/{totalCount} pronti
            </motion.span>
            <span className="text-slate-400 text-xs font-semibold">
              {Math.round(progressPercent)}% completato
            </span>
          </div>

          {/* Premium Gradient Progress Bar */}
          <div className="w-full h-3 bg-slate-950 rounded-full mt-2.5 overflow-hidden border border-slate-800">
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                background: isComplete
                  ? "linear-gradient(90deg, #10b981, #34d399, #6ee7b7)"
                  : `linear-gradient(90deg, #D97706 0%, #10B981 ${progressPercent}%, #10B981 100%)`,
                boxShadow: isComplete
                  ? "0 0 12px rgba(16,185,129,0.6), 0 0 4px rgba(16,185,129,0.4)"
                  : progressPercent > 30
                  ? "0 0 8px rgba(16,185,129,0.35)"
                  : undefined,
              }}
            />
          </div>

          {isComplete && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-400 text-xs font-bold mt-2 text-center tracking-wide"
            >
              🎉 Tutti i materiali sono pronti!
            </motion.p>
          )}
        </motion.div>

        {/* Categories Accordions */}
        <div className="space-y-3">
          {Array.from(categoriesMap.entries()).map(([category, items]) => {
            const isOpen = !!openAccordions[category];
            const checkedInCategory = items.filter((i) => i.checked).length;

            return (
              <div
                key={category}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/50 overflow-hidden shadow-sm"
              >
                {/* Accordion Header */}
                <button
                  onClick={() => handleToggleAccordion(category)}
                  className="w-full flex items-center justify-between px-5 py-4 font-bold text-left active:bg-slate-750 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-white text-base font-extrabold uppercase tracking-wide">
                      {category}
                    </span>
                    <span className="text-slate-400 text-xs font-medium mt-0.5">
                      {checkedInCategory}/{items.length} pronti
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-[#D97706]"
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </button>

                {/* Accordion Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 border-t border-slate-900/40 space-y-3">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleCheckbox(item.id)}
                            className="flex items-center space-x-3.5 cursor-pointer py-1"
                          >
                            {/* Checkbox with micro-interaction */}
                            <motion.div
                              whileTap={{ scale: 0.8 }}
                              transition={{ type: "spring", stiffness: 400, damping: 15 }}
                              className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                item.checked
                                  ? "bg-emerald-500 border-emerald-500"
                                  : "border-slate-500 bg-slate-950/40"
                              }`}
                            >
                              {item.checked && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                >
                                  <Check size={16} className="text-white stroke-[3.5]" />
                                </motion.div>
                              )}
                            </motion.div>
                            <span
                              className={`text-base font-semibold leading-none transition-all ${
                                item.checked
                                  ? "text-slate-500 line-through font-normal"
                                  : "text-slate-200"
                              }`}
                            >
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        <motion.button
          onClick={() => setShowResetConfirm(true)}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex-1 flex items-center justify-center space-x-2 border border-slate-700/80 active:bg-slate-800 text-slate-300 py-3.5 rounded-xl font-bold transition-colors text-sm"
        >
          <RotateCcw size={16} />
          <span>Resetta</span>
        </motion.button>
        <motion.button
          onClick={handleExportList}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex-1 flex items-center justify-center space-x-2 bg-[#D97706] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#D97706]/35 text-sm"
        >
          <Printer size={16} />
          <span>Condividi</span>
        </motion.button>
      </div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/80 w-full max-w-sm rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex items-center space-x-3 text-rose-500">
                <AlertTriangle size={24} />
                <h3 className="text-white font-extrabold text-lg">Resetta Spunte</h3>
              </div>
              <p className="text-slate-300 text-sm mt-3 leading-relaxed">
                Sei sicuro di voler resettare tutti i materiali? L'operazione non può essere annullata.
              </p>
              <div className="flex space-x-3 mt-5">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-3 text-slate-300 font-bold border border-slate-850 active:bg-slate-800 rounded-xl text-sm"
                >
                  Annulla
                </button>
                <button
                  onClick={handleResetSpunte}
                  className="flex-grow flex-1 py-3 bg-rose-600 active:bg-rose-700 text-white font-bold rounded-xl text-sm"
                >
                  Sì, resetta
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
