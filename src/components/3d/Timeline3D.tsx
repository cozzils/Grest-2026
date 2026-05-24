import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface TimelineProps {
  selectedWeek: number;
  onSelectWeek: (w: number) => void;
}

const Pillar = ({
  week,
  position,
  selected,
  onClick,
}: {
  week: number;
  position: [number, number, number];
  selected: boolean;
  onClick: (w: number) => void;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const colorBase = new THREE.Color('#1E3A8A');
  const colorHover = new THREE.Color('#2563EB');
  const colorSelected = new THREE.Color('#D97706');

  useFrame((_state, delta) => {
    if (!meshRef.current || !materialRef.current || !groupRef.current) return;

    const targetScaleY = selected ? 1.35 : hovered ? 1.15 : 1;
    const targetScaleXZ = selected ? 1.1 : hovered ? 1.06 : 1;
    meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, targetScaleY, delta * 6);
    meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScaleXZ, delta * 6);
    meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, targetScaleXZ, delta * 6);

    // Rotate on hover or when selected
    const targetRotY = selected ? _state.clock.elapsedTime * 0.6 : hovered ? _state.clock.elapsedTime * 0.35 : 0;
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotY, delta * 4);

    // Float Y position
    const targetY = selected
      ? Math.sin(_state.clock.elapsedTime * 1.5) * 0.12
      : hovered
      ? Math.sin(_state.clock.elapsedTime * 2) * 0.06
      : 0;
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, delta * 5);

    // Color interpolation
    const targetColor = selected ? colorSelected : hovered ? colorHover : colorBase;
    materialRef.current.color.lerp(targetColor, delta * 6);
    materialRef.current.emissive.lerp(selected ? colorSelected : hovered ? colorHover : new THREE.Color(0, 0, 0), delta * 5);
    materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(
      materialRef.current.emissiveIntensity,
      selected ? 0.6 : hovered ? 0.25 : 0,
      delta * 6
    );

    // Metalness and roughness shift on select/hover
    materialRef.current.metalness = THREE.MathUtils.lerp(materialRef.current.metalness, selected ? 0.95 : hovered ? 0.85 : 0.7, delta * 5);
    materialRef.current.roughness = THREE.MathUtils.lerp(materialRef.current.roughness, selected ? 0.05 : hovered ? 0.1 : 0.25, delta * 5);
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(week); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
        castShadow
      >
        <boxGeometry args={[1, 3, 1]} />
        <meshPhysicalMaterial
          ref={materialRef}
          color={colorBase}
          roughness={0.25}
          metalness={0.7}
          reflectivity={0.9}
          clearcoat={selected ? 1 : 0.3}
          clearcoatRoughness={0.05}
          emissive={new THREE.Color(0, 0, 0)}
          emissiveIntensity={0}
        />
      </mesh>

      {/* Dynamic point light on selected pillar */}
      {selected && (
        <pointLight
          position={[0, 2, 1]}
          intensity={2}
          color="#D97706"
          distance={4}
          decay={2}
        />
      )}

      <Html position={[0, 2.4, 0]} center>
        <div
          className={`font-display font-bold whitespace-nowrap px-4 py-1.5 rounded-full text-sm transition-all duration-300 cursor-pointer ${
            selected
              ? 'bg-secondary text-white shadow-[0_0_20px_rgba(217,119,6,0.6)] scale-110'
              : hovered
              ? 'bg-white/20 text-white backdrop-blur-md border border-white/20 scale-105'
              : 'bg-white/10 text-slate-300 backdrop-blur-md border border-white/10'
          }`}
          onClick={() => onClick(week)}
        >
          Settimana {week}
        </div>
      </Html>
    </group>
  );
};

export const Timeline3D: React.FC<TimelineProps> = ({ selectedWeek, onSelectWeek }) => {
  return (
    <div className="hidden md:block w-full h-64 relative mb-8">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 40 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <pointLight position={[-8, 6, -5]} intensity={0.8} color="#8b5cf6" />
        <pointLight position={[8, 4, 4]} intensity={0.6} color="#10B981" />

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
