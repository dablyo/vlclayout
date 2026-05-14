import { useEffect, useRef } from 'react';
import { useScene } from './useScene';
import { useLayouts } from './useLayouts';

export function useModuleControls() {
  const { selectedModuleId } = useScene();
  const { moveModule, isEditable } = useLayouts();
  const keysRef = useRef({});
  const selectedRef = useRef(selectedModuleId);
  const moveRef = useRef(moveModule);
  const isEditableRef = useRef(isEditable);

  selectedRef.current = selectedModuleId;
  moveRef.current = moveModule;
  isEditableRef.current = isEditable;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!e.ctrlKey) return;
      if (!isEditableRef.current) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();

        // Single press: move 1cm immediately
        const sid = selectedRef.current;
        if (!sid) return;

        let dx = 0;
        let dz = 0;
        if (e.key === 'ArrowUp') dz = -1;
        if (e.key === 'ArrowDown') dz = 1;
        if (e.key === 'ArrowLeft') dx = -1;
        if (e.key === 'ArrowRight') dx = 1;
        moveRef.current(sid, dx, dz);

        keysRef.current[e.key] = true;
      }
    };

    const onKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysRef.current[e.key] = false;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Held-key continuous movement (10cm/s) via rAF, only when keys are active
  useEffect(() => {
    let animId;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const sid = selectedRef.current;
      const keys = keysRef.current;

      if (sid && isEditableRef.current) {
        let dx = 0;
        let dz = 0;
        if (keys.ArrowUp) dz -= 10 * dt;
        if (keys.ArrowDown) dz += 10 * dt;
        if (keys.ArrowLeft) dx -= 10 * dt;
        if (keys.ArrowRight) dx += 10 * dt;

        if (dx !== 0 || dz !== 0) {
          moveRef.current(sid, dx, dz);
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);
}
