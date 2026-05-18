import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random particles
function Particles({ count = 2000 }) {
  const points = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = THREE.MathUtils.randFloatSpread(360); 
      const phi = THREE.MathUtils.randFloatSpread(360); 
      
      p[i * 3] = 40 * Math.sin(theta) * Math.cos(phi);
      p[i * 3 + 1] = 40 * Math.sin(theta) * Math.sin(phi);
      p[i * 3 + 2] = 40 * Math.cos(theta);
    }
    return p;
  }, [count]);

  useFrame((_state, delta) => {
    if (points.current) {
      points.current.rotation.x -= delta / 10;
      points.current.rotation.y -= delta / 15;
    }
  });

  return (
    <Points ref={points} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#a78bfa"
        size={0.15}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-900 via-primary to-slate-950">
      <Canvas camera={{ position: [0, 0, 15] }}>
        <Particles count={3000} />
      </Canvas>
    </div>
  );
};
