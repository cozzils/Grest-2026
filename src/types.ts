export interface Laboratory {
  id: string;
  nome: string;
  fascia: "elementari" | "medie";
  settimana: 1 | 2 | 3 | 4;
  giorno: "lun" | "mar" | "mer" | "gio" | "ven";
  descrizione: string;
  materiali: string[];
  categoria: string;
}
