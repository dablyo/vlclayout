import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Map center and default camera position
const MAP_CENTER = new THREE.Vector3(500, 0, 500);
const DEFAULT_CAM_POS = new THREE.Vector3(1200, 900, 1200);

export function useResetCamera() {
  const ref = useRef(null);
  return useCallback(() => {
    if (ref.current) ref.current();
  }, []);
}

export default function CameraControls({ onInit }) {
  const { camera } = useThree();
  const controlsRef = useRef();
  const keysRef = useRef({});
  const heldTimeRef = useRef({});
  const resetRef = useRef(null);

  // Center camera on map
  useEffect(() => {
    camera.position.copy(DEFAULT_CAM_POS);
    if (controlsRef.current) {
      controlsRef.current.target.copy(MAP_CENTER);
      controlsRef.current.update();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Expose reset function
  resetRef.current = () => {
    camera.position.copy(DEFAULT_CAM_POS);
    if (controlsRef.current) {
      controlsRef.current.target.copy(MAP_CENTER);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    if (onInit) onInit({ reset: () => resetRef.current?.() });
  }, [onInit]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (!keysRef.current[e.key]) {
          // Single press: jump 20cm immediately
          keysRef.current[e.key] = true;
          heldTimeRef.current[e.key] = 0;
          applyCameraMove(e.key, 20);
        }
        e.preventDefault();
      }
    };
    const onKeyUp = (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        keysRef.current[e.key] = false;
        delete heldTimeRef.current[e.key];
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function applyCameraMove(key, distance) {
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    const moveDir = new THREE.Vector3();
    if (key === 'ArrowUp') moveDir.add(forward);
    if (key === 'ArrowDown') moveDir.sub(forward);
    if (key === 'ArrowLeft') moveDir.sub(right);
    if (key === 'ArrowRight') moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(distance);
      camera.position.add(moveDir);
      if (controlsRef.current) {
        controlsRef.current.target.add(moveDir);
      }
    }
  }

  useFrame((_, delta) => {
    const keys = keysRef.current;
    const held = heldTimeRef.current;
    const heldKeys = Object.keys(held);
    if (heldKeys.length === 0) return;

    for (const key of heldKeys) {
      held[key] += delta;
    }

    // After initial press, apply 10cm/s continuous movement
    const moveDir = new THREE.Vector3();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
    right.y = 0;
    right.normalize();

    if (keys.ArrowUp) moveDir.add(forward);
    if (keys.ArrowDown) moveDir.sub(forward);
    if (keys.ArrowLeft) moveDir.sub(right);
    if (keys.ArrowRight) moveDir.add(right);

    if (moveDir.lengthSq() > 0) {
      moveDir.normalize().multiplyScalar(10 * delta);
      camera.position.add(moveDir);
      if (controlsRef.current) {
        controlsRef.current.target.add(moveDir);
      }
    }
  });

  return <OrbitControls ref={controlsRef} enableDamping />;
}
