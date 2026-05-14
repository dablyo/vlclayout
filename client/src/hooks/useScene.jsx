import { createContext, useContext, useState, useCallback, useRef } from 'react';

const SceneContext = createContext(null);

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}

export function SceneProvider({ children }) {
  const [showCoverage, setShowCoverage] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const resetCameraRef = useRef(null);

  const toggleCoverage = useCallback(() => {
    setShowCoverage((prev) => !prev);
  }, []);

  const selectModule = useCallback((id) => {
    setSelectedModuleId(id);
  }, []);

  const deselectModule = useCallback(() => {
    setSelectedModuleId(null);
  }, []);

  const registerResetCamera = useCallback((fn) => {
    resetCameraRef.current = fn;
  }, []);

  const resetCamera = useCallback(() => {
    resetCameraRef.current?.();
  }, []);

  return (
    <SceneContext.Provider
      value={{
        showCoverage,
        selectedModuleId,
        toggleCoverage,
        selectModule,
        deselectModule,
        registerResetCamera,
        resetCamera,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}
