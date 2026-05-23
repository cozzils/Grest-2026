import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Printer, Plus, X, FileText, Calendar } from "lucide-react";
import type { Laboratory } from "../../types";
import { DAYS_ORDER, DAY_NAMES, getCategoryStyles, getCheckedMaterials, saveCheckedMaterials } from "./utils";
import type { DayCode } from "./utils";
import html2canvas from "html2canvas";

interface TabOggiProps {
  laboratori: Laboratory[];
  selectedWeek: number;
  setSelectedWeek: (week: number) => void;
  activeDay: DayCode;
  setActiveDay: (day: DayCode) => void;
}

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

  const handleToggleMaterial = (category: string, materialName: string) => {
    const key = `${category}:${materialName}`;
    const newChecked = { ...checkedMaterials, [key]: !checkedMaterials[key] };
    setCheckedMaterials(newChecked);
    saveCheckedMaterials(newChecked);
  };

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
      // Temporarily expand styling for high-quality capture
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        backgroundColor: "#1e293b",
        scale: 2,
        logging: false,
        useCORS: true
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
  const handleDragEnd = (_event: any, info: any) => {
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
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
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
            </button>
          ))}
        </div>
      </div>

      {/* Day Selector */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-[#D97706]/10 sticky top-[96px] z-30 backdrop-blur-sm">
        <button
          onClick={() => handleDayChange("prev")}
          disabled={!hasPrev}
          className={`p-2 rounded-lg transition-colors ${
            hasPrev ? "text-[#D97706] active:bg-slate-700" : "text-slate-600 cursor-not-allowed"
          }`}
          aria-label="Giorno precedente"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[#D97706] text-lg font-black tracking-wider uppercase leading-none font-display">
            {DAY_NAMES[activeDay]}
          </span>
          <span className="text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-1">
            Settimana {selectedWeek}
          </span>
        </div>

        <button
          onClick={() => handleDayChange("next")}
          disabled={!hasNext}
          className={`p-2 rounded-lg transition-colors ${
            hasNext ? "text-[#D97706] active:bg-slate-700" : "text-slate-600 cursor-not-allowed"
          }`}
          aria-label="Giorno successivo"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Swipeable Main Area */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className="flex-grow flex flex-col p-4 pb-24 overflow-y-auto cursor-grab active:cursor-grabbing"
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

                {todayLabs.map((lab) => {
                  const styles = getCategoryStyles(lab.categoria);
                  const labNote = personalNotes[lab.id];

                  return (
                    <div
                      key={lab.id}
                      className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/50 shadow-lg relative overflow-hidden"
                    >
                      {/* Left accent strip by category */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${lab.categoria === 'Art & Craft' ? 'bg-amber-500' : lab.categoria === 'Sport/Gioco' ? 'bg-emerald-500' : lab.categoria === 'Cucina' ? 'bg-rose-500' : 'bg-slate-500'}`} />

                      <div className="flex justify-between items-start pl-2">
                        {/* Fascia badge & Category Badge */}
                        <div className="flex space-x-2">
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

                        {/* Note actions button */}
                        <button
                          onClick={() => handleOpenNoteModal(lab.id)}
                          className="text-slate-400 active:text-[#D97706] p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
                          aria-label="Aggiungi nota"
                        >
                          <Plus size={20} />
                        </button>
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

                      {/* Display Personal Note if any */}
                      {labNote && (
                        <div className="mt-3 mx-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start space-x-2">
                          <FileText size={16} className="text-amber-500 shrink-0 mt-0.5" />
                          <div className="flex-grow">
                            <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Nota Personale</p>
                            <p className="text-xs text-slate-200 mt-0.5">{labNote}</p>
                          </div>
                          <button
                            onClick={() => {
                              const newNotes = { ...personalNotes };
                              delete newNotes[lab.id];
                              setPersonalNotes(newNotes);
                              localStorage.setItem("grest_note_personali", JSON.stringify(newNotes));
                            }}
                            className="text-slate-400 active:text-rose-500"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}

                      {/* Materials Checklist */}
                      <div className="mt-5 pl-2">
                        <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                          <span>📍 Materiali</span>
                          <span className="text-[10px] lowercase font-normal italic">({lab.materiali?.length || 0} elementi)</span>
                        </div>

                        {lab.materiali && lab.materiali.length > 0 ? (
                          <div className="space-y-2.5">
                            {lab.materiali.map((mat) => {
                              const isChecked = !!checkedMaterials[`${lab.categoria || "Generale"}:${mat}`];
                              return (
                                <div
                                  key={mat}
                                  onClick={() => handleToggleMaterial(lab.categoria || "Generale", mat)}
                                  className="flex items-center space-x-3 cursor-pointer py-1 select-none"
                                >
                                  {/* Spring Anim Checkbox */}
                                  <motion.div
                                    whileTap={{ scale: 0.8 }}
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
                                      isChecked ? "text-slate-500 line-through font-normal" : "text-slate-200"
                                    }`}
                                  >
                                    {mat}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-500 text-xs italic pl-1">
                            Nessun materiale richiesto.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Floating Export Action buttons if labs have materials */}
        {todayLabs.some((l) => l.materiali && l.materiali.length > 0) && (
          <div className="flex justify-end space-x-3 mt-6 px-1">
            <button
              onClick={handleExportTodayList}
              className="flex items-center justify-center space-x-2 bg-[#D97706] active:bg-[#B45309] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[#D97706]/35 active:scale-95 transition-all text-sm w-full"
            >
              <Printer size={18} />
              <span>Esporta Lista Oggi</span>
            </button>
          </div>
        )}
      </motion.div>

      {/* Note Editing Modal */}
      <AnimatePresence>
        {editingNoteLabId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700/80 w-full max-w-md rounded-2xl p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h3 className="text-white font-bold text-lg">Aggiungi Nota Personale</h3>
                <button
                  onClick={() => setEditingNoteLabId(null)}
                  className="text-slate-400 active:text-rose-500"
                >
                  <X size={20} />
                </button>
              </div>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Scrivi qui i dettagli del materiale aggiuntivo o note per i ragazzi..."
                className="w-full h-32 bg-slate-950 text-slate-100 mt-4 p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-[#D97706] text-sm resize-none"
              />
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setEditingNoteLabId(null)}
                  className="flex-1 py-3 text-slate-300 font-bold border border-slate-800 active:bg-slate-800 rounded-xl text-sm"
                >
                  Annulla
                </button>
                <button
                  onClick={handleSaveNote}
                  className="flex-1 py-3 bg-[#D97706] active:bg-[#B45309] text-white font-bold rounded-xl text-sm"
                >
                  Salva Nota
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
