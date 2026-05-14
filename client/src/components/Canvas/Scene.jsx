import { useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import CameraControls from './CameraControls';
import MapGrid from './MapGrid';
import Module from './Module';
import { useScene } from '../../hooks/useScene';
import { useLayouts } from '../../hooks/useLayouts';

export default function Scene() {
  const { showCoverage, selectedModuleId, deselectModule, registerResetCamera } = useScene();
  const { modules } = useLayouts();

  const handleCameraInit = useCallback(({ reset }) => {
    registerResetCamera(reset);
  }, [registerResetCamera]);

  return (
    <Canvas
      camera={{ position: [1200, 900, 1200], fov: 60, near: 0.1, far: 5000 }}
      onPointerMissed={deselectModule}
    >
      <color attach="background" args={['#ffffff']} />
      <ambientLight intensity={1} />
      <CameraControls onInit={handleCameraInit} />
      <MapGrid />
      {modules.map((m) => (
        <Module
          key={m.id}
          id={m.id}
          x={m.x}
          z={m.z}
          height={m.height}
          angle={m.angle}
          color={m.color}
          isSelected={m.id === selectedModuleId}
          showCoverage={showCoverage}
        />
      ))}
    </Canvas>
  );
}
