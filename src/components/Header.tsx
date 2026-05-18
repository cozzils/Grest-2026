import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export const Header: React.FC = () => {
  const { scrollY } = useScroll();
  const height = useTransform(scrollY, [0, 100], [120, 80]);
  const opacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);

  return (
    <motion.header 
      style={{ height }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col justify-center bg-primary/80 backdrop-blur-xl shadow-[0_0_30px_rgba(30,58,138,0.5)] border-b border-white/10 overflow-hidden"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-center h-full">
        <motion.h1 style={{ scale, transformOrigin: 'left center' }} className="text-3xl md:text-4xl font-display font-bold text-white tracking-tight drop-shadow-md">
          GREST Ciliverghe
        </motion.h1>
        <motion.p style={{ opacity }} className="text-secondary font-medium text-sm md:text-base mt-1 tracking-wide">
          Calendario Laboratori Estivi
        </motion.p>
      </div>
    </motion.header>
  );
};
