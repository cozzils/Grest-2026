import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Printer, Plus, X, FileText, Calendar } from "lucide-react";
import type { Laboratory } from "../../types";
import { DAYS_ORDER, DAY_NAMES, getCategoryStyles, getCheckedMaterials, saveCheckedMaterials } from "./utils";
import type { DayCode } from "./utils";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";

interface TabOggiProps {
  laboratori: Laboratory[];
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  activeDay: DayCode;
  setActiveDay: (day: DayCode) => void;
}

/** Returns the gradient style for a lab card based on its category */
function getCategoryGradient(categoria: string): React.CSSProperties {
  switch (categoria) {
    case "Art & Craft":
      return {
        background:
          "radial-gradient(ellipse 80% 60% at 95% 5%, rgba(217,119,6,0.14) 0%, transparent 60%), rgba(30,41,59,0.92)",
      };
    case "Sport/Gioco":
      return {
        background:
          "radial-gradient(ellipse 80% 60% at 95% 5%, rgba(16,185,129,0.14) 0%, transparent 60%), rgba(30,41,59,0.92)",
      };
    case "Cucina":
      return {
        background:
          "radial-gradient(ellipse 80% 60% at 95% 5%, rgba(239,68,68,0.12) 0%, transparent 60%), rgba(30,41,59,0.92)",
      };
    default:
      return {
        background: "rgba(30,41,59,0.92)",
      };
  }
}

function getCategoryAccentColor(categoria: string): string {
  switch (categoria) {
    case "Art & Craft":
      return "#f59e0b";
    case "Sport/Gioco":
      return "#10b981";
    case "Cucina":
      return "#ef4444";
    default:
      return "#64748b";
  }
}

/** Fire confetti burst from center */
const fireConfetti = () => {
  const count = 120;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };
  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  confetti({
    ...defaults,
    particleCount: count * 0.25,
    origin: { x: randomInRange(0.3, 0.5), y: 0.6 },
    colors: ["#D97706", "#FCD34D", "#10B981", "#34D399"],
  });
  confetti({
    ...defaults,
    particleCount: count * 0.25,
    origin: { x: randomInRange(0.5, 0.7), y: 0.6 },
    colors: ["#8B5CF6", "#A78BFA", "#D97706", "#FCD34D"],
  });
};

export const TabOggi: React.FC<TabOggiProps> = ({
  laboratori,
  selectedWeek,
  setSelectedWeek,
  activeDay,
  setActiveDay,
}) => {
  const [checkedMaterials, setCheckedMaterials] = useState<Record<string, boolean>>({});
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({});
  const [editingNoteLabId, setEditingNoteLabId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const printAreaRef = useRef<HTMLDivElement>(null);
  // Track which labs already triggered confetti this session
  const confettiFiredRef = useRef<Set<string>>(new Set());

  // Load localStorage state
  useEffect(() => {
    setCheckedMaterials(getCheckedMaterials());

    // Load personal notes
    try {
      const notes = localStorage.getItem("grest_note_personali");
      if (notes) setPersonalNotes(JSON.parse(notes));
    } catch (e) {
      console.error("Error reading personal notes", e);
    }
  }, []);

  const handleDayChange = (direction: "prev" | "next") => {
    const currentIndex = DAYS_ORDER.indexOf(activeDay);
    if (direction === "prev" && currentIndex > 0) {
      setActiveDay(DAYS_ORDER[currentIndex - 1]);
    } else if (direction === "next" && currentIndex < DAYS_ORDER.length - 1) {
      setActiveDay(DAYS_ORDER[currentIndex + 1]);
    }
  };

  const handleToggleMaterial = useCallback(
    (lab: Laboratory, materialName: string) => {
      const key = `${lab.categoria || "Generale"}:${materialName}`;
      const newChecked = { ...checkedMaterials, [key]: !checkedMaterials[key] };
      setCheckedMaterials(newChecked);
      saveCheckedMaterials(newChecked);

      // Check if ALL materials of this lab are now checked → confetti!
      if (lab.materiali && lab.materiali.length > 0) {
        const allChecked = lab.materiali.every((mat) => {
          const k = `${lab.categoria || "Generale"}:${mat}`;
          return k === key ? !checkedMaterials[key] : !!newChecked[k];
        });
        if (allChecked && !confettiFiredRef.current.has(lab.id)) {
          confettiFiredRef.current.add(lab.id);
          setTimeout(fireConfetti, 150);
        } else if (!allChecked) {
          // Reset confetti flag if user un-checks
          confettiFiredRef.current.delete(lab.id);
        }
      }
    },
    [checkedMaterials]
  );

  const handleOpenNoteModal = (labId: string) => {
    setEditingNoteLabId(labId);
    setNoteInput(personalNotes[labId] || "");
  };

  const handleSaveNote = () => {
    if (!editingNoteLabId) return;
    const newNotes = { ...personalNotes, [editingNoteLabId]: noteInput.trim() };
    setPersonalNotes(newNotes);
    localStorage.setItem("grest_note_personali", JSON.stringify(newNotes));
    setEditingNoteLabId(null);
  };

  const handleExportTodayList = async () => {
    if (!printAreaRef.current) return;
    try {
      const canvas = await html2canvas(printAreaRef.current, {
        backgroundColor: "#1e293b",
        scale: 2,
        logging: false,
        useCORS: true,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `Materiali_GREST_Sett${selectedWeek}_${DAY_NAMES[activeDay]}.png`;
      link.click();
    } catch (error) {
      console.error("Error capturing screen:", error);
    }
  };

  // Filter laboratories for selected week and day
  const todayLabs = laboratori.filter(
    (l) => l.settimana === selectedWeek && l.giorno === activeDay
  );

  const activeDayIndex = DAYS_ORDER.indexOf(activeDay);
  const hasPrev = activeDayIndex > 0;
  const hasNext = activeDayIndex < DAYS_ORDER.length - 1;

  // Swipe drag gesture handlers
  const handleDragEnd = (_event: unknown, info: { offset: { x: number } }) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      handleDayChange("prev");
    } else if (info.offset.x < -swipeThreshold) {
      handleDayChange("next");
    }
  };

  return (
    <div className="flex flex-col flex-grow w-full select-none overflow-hidden">
      {/* Week Selector Tab Row */}
      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800/80 sticky top-[48px] z-30 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-extrabold uppercase tracking-wider shrink-0">
          <Calendar size={14} className="text-[#D97706]" />
          <span>Settimana</span>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80 grow max-w-[240px] relative">
          {[1, 2, 3, 4].map((w) => (
            <motion.button
              key={w}
              onClick={() => setSelectedWeek(w)}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                selectedWeek === w
                  ? "text-white font-extrabold"
                  : "text-slate-400 active:bg-slate-900 hover:text-slate-200"
              }`}
            >
              {selectedWeek === w && (
                <motion.div
                  layoutId="activeMobileWeek"
                  className="absolute inset-0 bg-[#D97706] rounded-lg shadow-md shadow-[#D97706]/20"
                  style={{ zIndex: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{w}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b border-[#D97706]/10 sticky top-[96px] z-30"
        style={{
          background: "rgba(30,41,59,0.8)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <motion.button
          onClick={() => handleDayChange("prev")}
          disabled={!hasPrev}
          whileTap={hasPrev ? { scale: 0.85 } : {}}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`p-2 rounded-lg transition-colors ${
            hasPrev ? "text-[#D97706] active:bg-slate-700" : "text-slate-600 cursor-not-allowed"
          }`}
          aria-label="Giorno precedente"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <div className="flex flex-col items-center">
          <span className="text-[#D97706] text-lg font-black tracking-wider uppercase leading-none font-display">
            {DAY_NAMES[activeDay]}
          </span>
          <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">
            Settimana {selectedWeek}
          </span>
        </div>

        <motion.button
          onClick={() => handleDayChange("next")}
          disabled={!hasNext}
          whileTap={hasNext ? { scale: 0.85 } : {}}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className={`p-2 rounded-lg transition-colors ${
            hasNext ? "text-[#D97706] active:bg-slate-700" : "text-slate-600 cursor-not-allowed"
          }`}
          aria-label="Giorno successivo"
        >
          <ChevronRight size={24} />
        </motion.button>
      </div>

      {/* Swipeable Main Area */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="flex-grow flex flex-col p-4 pb-28 overflow-y-auto cursor-grab active:cursor-grabbing"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedWeek}-${activeDay}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col space-y-4 flex-grow"
          >
            {todayLabs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
                <p className="text-lg font-semibold">Nessun laboratorio oggi</p>
                <p className="text-sm mt-1">Giornata libera o gita!</p>
              </div>
            ) : (
              <div ref={printAreaRef} className="space-y-4">
                <div className="text-[10px] text-slate-400 font-semibold px-1 tracking-wider uppercase">
                  Settimana {selectedWeek} • Attività di oggi
                </div>

                {todayLabs.map((lab, i) => {
                  const styles = getCategoryStyles(lab.categoria);
                  const labNote = personalNotes[lab.id];
                  const accentColor = getCategoryAccentColor(lab.categoria);
                  const gradientStyle = getCategoryGradient(lab.categoria);

                  // Calculate per-lab material progress
                  const labMats = lab.materiali ?? [];
                  const checkedCount = labMats.filter(
                    (mat) => !!checkedMaterials[`${lab.categoria || "Generale"}:${mat}`]
                  ).length;
                  const labProgressPct = labMats.length > 0 ? (checkedCount / labMats.length) * 100 : 0;

                  return (
                    <motion.div
                      key={lab.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.06 }}
                      className="rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden"
                      style={gradientStyle}
                    >
                      {/* Left accent strip by category */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
                        style={{ background: accentColor }}
                      />

                      <div className="flex justify-between items-start pl-2">
                        {/* Fascia badge & Category Badge */}
                        <div className="flex space-x-2 flex-wrap gap-y-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              lab.fascia === "elementari"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {lab.fascia}
                          </span>
                          {lab.categoria && (
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${styles.bg} ${styles.text} border ${styles.border}`}
                            >
                              {lab.categoria}
                            </span>
                          )}
                        </div>

                        {/* Note button */}
                        <motion.button
                          onClick={() => handleOpenNoteModal(lab.id)}
                          whileTap={{ scale: 0.85 }}
                          transition={{ type: "spring", stiffness: 500, damping: 20 }}
                          className="text-slate-400 active:text-[#D97706] p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                          aria-label="Aggiungi nota"
                        >
                          <Plus size={18} />
                        </motion.button>
                      </div>

                      {/* Lab Name */}
                      <h2 className="text-2xl font-black text-white pl-2 mt-3 leading-tight font-display">
                        {lab.nome}
                      </h2>

                      {/* Description */}
                      {lab.descrizione && (
                        <p className="text-slate-300 pl-2 mt-2 text-sm leading-relaxed border-l-2 border-slate-700 italic">
                          {lab.descrizione}
                        </p>
                      )}

                      {/* Personal Note */}
                      {labNote && (
                        <div className="mt-3 mx-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2">
                          <FileText size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-grow">
                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                              Nota Personale
                            </p>
                            <p className="text-xs text-slate-200 mt-0.5">{labNote}</p>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => {
                              const newNotes = { ...personalNotes };
                              delete newNotes[lab.id];
                              setPersonalNotes(newNotes);
                              localStorage.setItem(
                                "grest_note_personali",
                                JSON.stringify(newNotes)
                              );
                            }}
                            className="text-slate-400 active:text-rose-500"
                          >
                            <X size={14} />
                          </motion.button>
                        </div>
                      )}

                      {/* Materials Checklist */}
                      <div className="mt-5 pl-2">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                          <span>📍 Materiali</span>
                          {labMats.length > 0 && (
                            <span
                              className="text-[10px] lowercase font-semibold normal-case"
                              style={{ color: labProgressPct === 100 ? "#10b981" : undefined }}
                            >
                              {checkedCount}/{labMats.length}
                              {labProgressPct === 100 && " ✓"}
                            </span>
                          )}
                        </div>

                        {/* Gradient progress bar for per-lab materials */}
                        {labMats.length > 0 && (
                          <div className="w-full h-1.5 bg-slate-950/60 rounded-full mb-3 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${labProgressPct}%` }}
                              transition={{ duration: 0.4, ease: "easeOut" }}
                              style={{
                                background:
                                  labProgressPct === 100
                                    ? "linear-gradient(90deg, #10b981, #34d399)"
                                    : `linear-gradient(90deg, ${accentColor}, #10b981)`,
                                boxShadow:
                                  labProgressPct === 100
                                    ? "0 0 8px rgba(16,185,129,0.5)"
                                    : undefined,
                              }}
                            />
                          </div>
                        )}

                        {labMats.length > 0 ? (
                          <div className="space-y-2.5">
                            {labMats.map((mat) => {
                              const isChecked =
                                !!checkedMaterials[`${lab.categoria || "Generale"}:${mat}`];
                              return (
                                <motion.div
                                  key={mat}
                                  onClick={() => handleToggleMaterial(lab, mat)}
                                  whileTap={{ scale: 0.97 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                  className="flex items-center space-x-3 cursor-pointer py-1 select-none"
                                >
                                  {/* Spring Anim Checkbox */}
                                  <motion.div
                                    whileTap={{ scale: 0.78 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                      isChecked
                                        ? "bg-emerald-500 border-emerald-500"
                                        : "border-slate-500 bg-slate-900/40"
                                    }`}
                                  >
                                    {isChecked && (
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
                                      isChecked
                                        ? "text-slate-500 line-through font-normal"
                                        : "text-slate-200"
                                    }`}
                                  >
                                    {mat}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-xs italic pl-1">
                            Nessun materiale richiesto.
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Export Action button */}
        {todayLabs.some((l) => l.materiali && l.materiali.length > 0) && (
          <div className="flex justify-end space-x-3 mt-6 px-1">
            <motion.button
              onClick={handleExportTodayList}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex items-center justify-center space-x-2 bg-[#D97706] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#D97706]/35 text-sm w-full"
            >
              <Printer size={18} />
              <span>Esporta Lista Oggi</span>
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Note Editing Modal */}
      <AnimatePresence>
        {editingNoteLabId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-white font-bold text-lg">Aggiungi Nota Personale</h3>
                <motion.button
                  onClick={() => setEditingNoteLabId(null)}
                  whileTap={{ scale: 0.85 }}
                  className="text-slate-400 active:text-rose-500 p-1"
                >
                  <X size={20} />
                </motion.button>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Scrivi qui i dettagli del materiale aggiuntivo o note per i ragazzi..."
                className="w-full h-32 bg-slate-950 text-slate-100 mt-4 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#D97706] text-sm resize-none"
              />
              <div className="flex space-x-3 mt-4">
                <motion.button
                  onClick={() => setEditingNoteLabId(null)}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3 text-slate-300 font-bold border border-slate-800 active:bg-slate-800 rounded-xl text-sm"
                >
                  Annulla
                </motion.button>
                <motion.button
                  onClick={handleSaveNote}
                  whileTap={{ scale: 0.96 }}
                  className="flex-1 py-3 bg-[#D97706] active:bg-[#B45309] text-white font-bold rounded-xl text-sm"
                >
                  Salva Nota
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
