import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Laboratory } from "../types";
import { ChevronDown, CheckCircle2, Circle } from "lucide-react";

interface MaterialsListProps {
  laboratori: Laboratory[];
}

export const MaterialsList: React.FC<MaterialsListProps> = ({ laboratori }) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem("grest_materials_checked");
    return saved ? JSON.parse(saved) : {};
  });

  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    localStorage.setItem("grest_materials_checked", JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const groupedMaterials: Record<string, { materiale: string, labs: string[] }[]> = {};
  laboratori.forEach(lab => {
    if (!groupedMaterials[lab.categoria]) groupedMaterials[lab.categoria] = [];
    lab.materiali.forEach(mat => {
      const existing = groupedMaterials[lab.categoria].find(m => m.materiale.toLowerCase() === mat.toLowerCase());
      if (existing) {
        if (!existing.labs.includes(lab.nome)) existing.labs.push(lab.nome);
      } else {
        groupedMaterials[lab.categoria].push({ materiale: mat, labs: [lab.nome] });
      }
    });
  });

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "art & craft": return "text-secondary";
      case "sport/gioco": return "text-tertiary";
      case "cucina": return "text-error";
      default: return "text-primary";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-heavy rounded-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Materiali Completi</h2>
          <p className="text-slate-400 mb-8">
            Usa le spunte per tenere traccia di cosa hai già preparato. I dati sono salvati sul tuo dispositivo.
          </p>

          <div className="space-y-4">
            {Object.entries(groupedMaterials).map(([categoria, materiali]) => {
              const isExpanded = expandedCategories[categoria] !== false; // Default true
              const completedCount = materiali.filter(m => checkedItems[`${categoria}-${m.materiale}`.replace(/\s+/g, '-').toLowerCase()]).length;
              
              return (
                <div key={categoria} className="glass-panel rounded-xl overflow-hidden">
                  <button 
                    onClick={() => toggleCategory(categoria)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <h3 className={`text-lg font-bold ${getCategoryColor(categoria)} tracking-wide`}>
                        {categoria}
                      </h3>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-slate-300">
                        {completedCount} / {materiali.length}
                      </span>
                    </div>
                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="text-slate-400" />
                    </motion.div>
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-6 pb-6 pt-2">
                          {materiali.length === 0 ? (
                            <p className="text-sm text-slate-500 italic">Nessun materiale</p>
                          ) : (
                            <ul className="space-y-3">
                              {materiali.map((item, idx) => {
                                const id = `${categoria}-${item.materiale}`.replace(/\s+/g, '-').toLowerCase();
                                const isChecked = checkedItems[id] || false;
                                
                                return (
                                  <motion.li 
                                    key={id} 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="flex items-start group cursor-pointer" 
                                    onClick={() => toggleCheck(id)}
                                  >
                                    <div className="flex-shrink-0 mt-0.5 text-tertiary">
                                      {isChecked ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6 text-slate-500 group-hover:text-tertiary/50 transition-colors" />}
                                    </div>
                                    <div className="ml-3 flex-grow">
                                      <span className={`block text-base transition-colors duration-200 ${isChecked ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                                        {item.materiale}
                                      </span>
                                      <span className="block text-xs text-slate-500 mt-0.5">
                                        Usato in: {item.labs.join(", ")}
                                      </span>
                                    </div>
                                  </motion.li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
