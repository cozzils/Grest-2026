import type { Laboratory } from "../../types";

export type DayCode = "lun" | "mar" | "mer" | "gio" | "ven";

export const DAYS_ORDER: DayCode[] = ["lun", "mar", "mer", "gio", "ven"];

export const DAY_NAMES: Record<DayCode, string> = {
  lun: "Lunedì",
  mar: "Martedì",
  mer: "Mercoledì",
  gio: "Giovedì",
  ven: "Venerdì"
};

export interface MaterialItem {
  id: string; // "Category:MaterialName"
  name: string;
  category: string;
  checked: boolean;
}

// Map categories to standard colors
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; badge: string }> = {
  "Art & Craft": {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    badge: "bg-amber-600 text-white"
  },
  "Sport/Gioco": {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    badge: "bg-emerald-600 text-white"
  },
  "Cucina": {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    border: "border-rose-500/20",
    badge: "bg-rose-600 text-white"
  },
  "default": {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    badge: "bg-slate-600 text-white"
  }
};

export const getCategoryStyles = (category: string) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS["default"];
};

// LocalStorage helpers
const LOCAL_STORAGE_KEY = "grest_materiali_spuntati";

export const getCheckedMaterials = (): Record<string, boolean> => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error("Error reading localStorage", e);
    return {};
  }
};

export const saveCheckedMaterials = (checked: Record<string, boolean>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(checked));
  } catch (e) {
    console.error("Error writing localStorage", e);
  }
};

// Aggregates all materials from laboratories list, mapping them with checked state
export const aggregateAllMaterials = (laboratori: Laboratory[]): MaterialItem[] => {
  const checkedMap = getCheckedMaterials();
  const uniqueItems = new Map<string, { name: string; category: string }>();

  laboratori.forEach((lab) => {
    const category = lab.categoria || "Generale";
    (lab.materiali || []).forEach((mat) => {
      const cleanMat = mat.trim();
      if (!cleanMat) return;
      
      const id = `${category}:${cleanMat}`;
      if (!uniqueItems.has(id)) {
        uniqueItems.set(id, { name: cleanMat, category });
      }
    });
  });

  return Array.from(uniqueItems.entries()).map(([id, item]) => ({
    id,
    name: item.name,
    category: item.category,
    checked: !!checkedMap[id]
  }));
};
