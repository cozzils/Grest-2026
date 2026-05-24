import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export const MobileHeader: React.FC = () => {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long",
      };

      // Format: "Lunedì, 10 Giugno - 09:30"
      const datePart = now.toLocaleDateString("it-IT", options);
      // Capitalize first letter
      const capitalizedDate =
        datePart.charAt(0).toUpperCase() + datePart.slice(1);

      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");

      setTimeStr(`${capitalizedDate} — ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full border-b border-white/5 px-5 py-3 flex flex-col justify-center items-center"
      style={{
        background: "rgba(2, 6, 23, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 2px 20px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Subtle amber accent line at bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] rounded-full"
        style={{
          width: "40%",
          background:
            "linear-gradient(90deg, transparent, rgba(217,119,6,0.5), transparent)",
        }}
      />

      <h1 className="text-white text-sm font-black tracking-widest uppercase font-display">
        GREST Ciliverghe
      </h1>
      <motion.span
        key={timeStr}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-[11px] font-semibold mt-0.5"
        style={{ color: "rgba(217,119,6,0.9)" }}
      >
        {timeStr || "Caricamento data/ora..."}
      </motion.span>
    </motion.header>
  );
};
