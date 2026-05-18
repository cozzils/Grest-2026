import React from "react";
import type { Laboratory } from "../types";
import { Tag } from "lucide-react";
import clsx from "clsx";

interface LabCardProps {
  lab: Laboratory;
  onClick: (lab: Laboratory) => void;
}

export const LabCard: React.FC<LabCardProps> = ({ lab, onClick }) => {
  // Define color mapping based on category for the accent bar
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "art & craft":
        return "bg-secondary"; // Orange
      case "sport/gioco":
        return "bg-tertiary"; // Green
      default:
        return "bg-primary"; // Navy
    }
  };

  return (
    <div
      onClick={() => onClick(lab)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden flex flex-col h-full border border-gray-100"
    >
      {/* Accent left bar */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-1.5", getCategoryColor(lab.categoria))} />
      
      <div className="p-4 pl-5 flex flex-col flex-grow">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
          {lab.categoria}
        </div>
        <h3 className="text-lg font-display font-semibold text-primary mb-2 line-clamp-2">
          {lab.nome}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {lab.descrizione}
        </p>

        <div className="mt-auto flex items-center text-xs text-gray-500 space-x-3">
          <div className="flex items-center">
            <Tag className="w-3.5 h-3.5 mr-1" />
            <span>{lab.materiali.length} Mat.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
