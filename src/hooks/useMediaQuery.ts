import { useState, useEffect } from "react";

/**
 * Hook personalizzato che rileva dinamicamente se la viewport è mobile.
 * Ritorna `true` se la larghezza è inferiore alla soglia specificata.
 * Questo permette il rendering condizionale completo dei componenti,
 * evitando l'inizializzazione di WebGL/Three.js su dispositivi mobili.
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use the modern addEventListener API
    mediaQueryList.addEventListener("change", listener);
    // Sync immediately in case the window resized before the effect ran
    setMatches(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
};

/** Shortcut: returns true when viewport width < 768px (Tailwind "md" breakpoint) */
export const useIsMobile = (): boolean => useMediaQuery("(max-width: 767px)");
