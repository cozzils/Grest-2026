import React, { useState, useEffect } from "react";

export const MobileHeader: React.FC = () => {
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "long"
      };
      
      // Format: "Lunedì, 10 Giugno - 09:30"
      const datePart = now.toLocaleDateString("it-IT", options);
      // Capitalize first letter
      const capitalizedDate = datePart.charAt(0).toUpperCase() + datePart.slice(1);
      
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      
      setTimeStr(`${capitalizedDate} - ${hours}:${minutes}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1E3A8A] border-b border-[#D97706]/15 px-4 py-3 flex flex-col justify-center items-center shadow-md">
      <h1 className="text-white text-base font-bold tracking-wide uppercase">
        GREST Ciliverghe
      </h1>
      <span className="text-[#D97706] text-xs font-semibold mt-0.5">
        {timeStr || "Caricamento data/ora..."}
      </span>
    </header>
  );
};
