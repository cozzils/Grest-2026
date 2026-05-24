import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Laboratory } from "./types";
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import type { TabType } from "./components/Tabs";
import { CalendarGrid } from "./components/CalendarGrid";
import { MaterialsList } from "./components/MaterialsList";
import { Background3D } from "./components/3d/Background3D";
import { Timeline3D } from "./components/3d/Timeline3D";
import { MobileApp } from "./components/mobile/MobileApp";
import { CreativeLoader } from "./components/CreativeLoader";
import { useIsMobile } from "./hooks/useMediaQuery";

function DesktopApp({
  laboratori,
  loading,
}: {
  laboratori: Laboratory[];
  loading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("elementari");
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  return (
    <div className="flex min-h-screen flex-col text-slate-100 font-sans">
      <Background3D />
      <Header />

      {/* Spacer for fixed header */}
      <div className="h-[120px]" />

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 relative z-10">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "elementari" && (
              <motion.div
                key="elementari"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Timeline3D
                  selectedWeek={selectedWeek}
                  onSelectWeek={setSelectedWeek}
                />
                <CalendarGrid
                  laboratori={laboratori.filter(
                    (l) =>
                      l.fascia === "elementari" && l.settimana === selectedWeek
                  )}
                />
              </motion.div>
            )}

            {activeTab === "medie" && (
              <motion.div
                key="medie"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Timeline3D
                  selectedWeek={selectedWeek}
                  onSelectWeek={setSelectedWeek}
                />
                <CalendarGrid
                  laboratori={laboratori.filter(
                    (l) => l.fascia === "medie" && l.settimana === selectedWeek
                  )}
                />
              </motion.div>
            )}

            {activeTab === "materiali" && (
              <motion.div
                key="materiali"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MaterialsList laboratori={laboratori} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-8 text-center text-slate-500 text-sm relative z-10 bg-slate-950/50 backdrop-blur-sm border-t border-white/5"
      >
        <p>GREST Ciliverghe © 2026 - Piattaforma Laboratori 3D</p>
      </motion.footer>
    </div>
  );
}

function App() {
  const [laboratori, setLaboratori] = useState<Laboratory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  // True conditional rendering: WebGL components are never mounted on mobile
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/laboratori.json")
      .then((res) => res.json())
      .then((data) => {
        setLaboratori(data);
        setLoading(false);
      });
  }, []);

  return (
    <>
      {/* Creative Loader — shown once on first visit, then completely unmounted */}
      <AnimatePresence>
        {showLoader && (
          <CreativeLoader onComplete={() => setShowLoader(false)} />
        )}
      </AnimatePresence>

      {/* Conditional rendering: mobile gets NO WebGL, desktop gets full 3D scene */}
      {!showLoader && (
        <>
          {isMobile ? (
            <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100 font-sans">
              <MobileApp laboratori={laboratori} loading={loading} />
            </div>
          ) : (
            <DesktopApp laboratori={laboratori} loading={loading} />
          )}
        </>
      )}
    </>
  );
}

export default App;
