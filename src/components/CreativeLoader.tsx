import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

// --- Animated 3D TorusKnot ---
function FloatingKnot({ progress }: { progress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_state, delta) => {
    if (meshRef.current) {
      // Rotation accelerates as progress increases
      const speed = 0.3 + (progress / 100) * 1.5;
      meshRef.current.rotation.x += delta * speed * 0.6;
      meshRef.current.rotation.y += delta * speed * 0.9;
      meshRef.current.rotation.z += delta * speed * 0.3;

      // Subtle pulse on the Y scale
      const pulse = 1 + Math.sin(_state.clock.elapsedTime * 2) * 0.04;
      meshRef.current.scale.setScalar(pulse);
    }
    if (materialRef.current) {
      // Color shifts from deep violet to amber as loading completes
      const t = progress / 100;
      materialRef.current.emissiveIntensity = 0.3 + t * 0.7;
      materialRef.current.color.setRGB(
        0.35 + t * 0.5,
        0.2 + t * 0.4,
        0.8 - t * 0.5
      );
      materialRef.current.emissive.setRGB(
        0.5 + t * 0.35,
        0.25 + t * 0.35,
        0.8 - t * 0.65
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.4, 0.45, 180, 24, 2, 3]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#8b5cf6"
        emissive="#7c3aed"
        emissiveIntensity={0.3}
        roughness={0.1}
        metalness={0.85}
        wireframe={false}
      />
    </mesh>
  );
}

// --- Particle field for ambient depth ---
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = React.useMemo(() => {
    const p = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      p[i * 3] = (Math.random() - 0.5) * 30;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return p;
  }, []);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#a78bfa"
        size={0.08}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// --- Main Loader Component ---
interface CreativeLoaderProps {
  onComplete: () => void;
}

export const CreativeLoader: React.FC<CreativeLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Smooth counter: starts fast, eases near 100
    let current = 0;
    const targetDuration = 2200; // ms total
    const startTime = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTime;
      const linear = Math.min(elapsed / targetDuration, 1);
      // Ease out cubic: fast at start, slow at end
      const eased = 1 - Math.pow(1 - linear, 3);
      current = Math.floor(eased * 100);
      setProgress(current);

      if (current < 100) {
        requestAnimationFrame(tick);
      } else {
        // Brief pause at 100% then trigger exit animation
        setTimeout(() => {
          setExiting(true);
          setTimeout(onComplete, 750); // wait for slide-up animation
        }, 350);
      }
    };

    requestAnimationFrame(tick);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden"
          style={{ pointerEvents: "all" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 60% 50% at 50% 50%, rgba(109,40,217,${0.08 + (progress / 100) * 0.15}) 0%, transparent 70%)`,
            }}
          />

          {/* 3D Canvas - centered, not full screen, to keep performance light */}
          <div className="w-56 h-56 md:w-72 md:h-72 relative z-10">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 45 }}
              dpr={[1, 1.5]}
              gl={{ antialias: true, alpha: true }}
              style={{ background: "transparent" }}
            >
              <ambientLight intensity={0.3} />
              <pointLight position={[5, 5, 5]} intensity={2} color="#d97706" />
              <pointLight position={[-5, -5, 5]} intensity={1.2} color="#8b5cf6" />
              <AmbientParticles />
              <FloatingKnot progress={progress} />
            </Canvas>
          </div>

          {/* Counter */}
          <div className="relative z-10 mt-6 flex flex-col items-center select-none">
            <div className="flex items-end space-x-1">
              <motion.span
                key={progress}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.08 }}
                className="text-6xl md:text-7xl font-black text-white tracking-tighter font-display tabular-nums"
                style={{
                  textShadow: `0 0 ${20 + progress / 3}px rgba(139,92,246,0.6)`,
                }}
              >
                {progress}
              </motion.span>
              <span className="text-3xl font-bold text-violet-400 mb-2">%</span>
            </div>

            {/* Progress bar */}
            <div className="w-48 md:w-64 h-[3px] bg-white/10 rounded-full mt-4 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, #7c3aed, #d97706)`,
                  boxShadow: "0 0 10px rgba(217,119,6,0.6)",
                }}
                transition={{ duration: 0.05 }}
              />
            </div>

            <p className="mt-4 text-slate-500 text-xs font-semibold tracking-widest uppercase">
              {progress < 50
                ? "Caricamento attività..."
                : progress < 90
                ? "Preparando i laboratori..."
                : "Quasi pronto..."}
            </p>
          </div>

          {/* Brand watermark */}
          <div className="absolute bottom-8 text-center text-slate-700 text-xs tracking-wider select-none">
            GREST Ciliverghe · 2026
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="curtain"
          initial={{ y: 0 }}
          animate={{ y: "-100%" }}
          transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] bg-slate-950"
        />
      )}
    </AnimatePresence>
  );
};
