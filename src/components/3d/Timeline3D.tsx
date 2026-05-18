import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TimelineProps {
  selectedWeek: number;
  onSelectWeek: (w: number) => void;
}

const Pillar = ({ week, position, selected, onClick }: { week: number, position: [number, number, number], selected: boolean, onClick: (w: number) => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  
  const targetScale = selected ? 1.2 : 1;
  const colorUnselected = new THREE.Color('#1E3A8A');
  const colorSelected = new THREE.Color('#D97706');

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScale, delta * 5);
    }
    if (materialRef.current) {
      materialRef.current.color.lerp(selected ? colorSelected : colorUnselected, delta * 5);
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, selected ? 0.5 : 0, delta * 5);
    }
  });

  return (
    <group position={position}>
      <mesh 
        ref={meshRef} 
        onClick={(e) => { e.stopPropagation(); onClick(week); }} 
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <boxGeometry args={[1, 3, 1]} />
        <meshStandardMaterial 
          ref={materialRef} 
          color={colorUnselected} 
          roughness={0.2} 
          metalness={0.8}
          emissive={colorSelected}
          emissiveIntensity={0}
        />
      </mesh>
      <Html position={[0, 2.2, 0]} center>
        <div 
          className={`font-display font-bold whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all duration-300 ${
            selected 
              ? 'bg-secondary text-white shadow-[0_0_15px_rgba(217,119,6,0.5)] scale-110' 
              : 'bg-white/10 text-slate-300 backdrop-blur-md border border-white/10 hover:bg-white/20'
          }`}
          onClick={() => onClick(week)}
        >
          Settimana {week}
        </div>
      </Html>
    </group>
  );
}

export const Timeline3D: React.FC<TimelineProps> = ({ selectedWeek, onSelectWeek }) => {
  return (
    <div className="hidden md:block w-full h-64 relative mb-8">
      {/* Fallback for very small heights or when WebGL fails is not easily detectable, but standard HTML fallback is possible. For now we assume Canvas works. */}
      <Canvas camera={{ position: [0, 3, 10], fov: 40 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, 5, -10]} intensity={0.5} color="#10B981" />
        <group position={[-4.5, -0.5, 0]}>
          {[1, 2, 3, 4].map((w, i) => (
            <Pillar 
              key={w} 
              week={w} 
              position={[i * 3, 0, 0]} 
              selected={selectedWeek === w}
              onClick={onSelectWeek}
            />
          ))}
        </group>
      </Canvas>
    </div>
  );
};
