import React, { useEffect } from "react";
import type { Laboratory } from "../types";
import { X, CheckCircle2 } from "lucide-react";

interface LabModalProps {
  lab: Laboratory;
  onClose: () => void;
}

export const LabModal: React.FC<LabModalProps> = ({ lab, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1 block">
              {lab.categoria} • Settimana {lab.settimana} • {lab.giorno.toUpperCase()}
            </span>
            <h2 className="text-2xl font-display font-bold text-primary">
              {lab.nome}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Descrizione</h3>
            <p className="text-gray-600 leading-relaxed">
              {lab.descrizione}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Materiali Necessari</h3>
            {lab.materiali.length > 0 ? (
              <ul className="space-y-2">
                {lab.materiali.map((materiale, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-tertiary mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{materiale}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic text-sm">Nessun materiale specificato per questo laboratorio.</p>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 pt-0">
          <button 
            onClick={onClose}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-container text-white rounded-xl font-medium transition-colors shadow-sm"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
