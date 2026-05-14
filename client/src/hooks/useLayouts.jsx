import { createContext, useContext, useState, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { getModuleColor } from '../utils/colors';
import { useToast } from './useToast';

const LayoutContext = createContext(null);

export function useLayouts() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayouts must be used within LayoutProvider');
  return ctx;
}

export function LayoutProvider({ children }) {
  const [modules, setModules] = useState([]);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  const [isOwner, setIsOwner] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const { showToast } = useToast();

  const fetchLayouts = useCallback(async () => {
    try {
      const data = await apiFetch('/api/layouts');
      setSavedLayouts(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  const createModule = useCallback(() => {
    setModules((prev) => {
      const nextId = prev.length > 0 ? Math.max(...prev.map((m) => m.id)) + 1 : 1;
      return [
        ...prev,
        {
          id: nextId,
          x: 500,
          z: 500,
          height: 200,
          angle: 90,
          color: getModuleColor(prev.length),
        },
      ];
    });
  }, []);

  const deleteModule = useCallback((id) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const updateModule = useCallback((id, updates) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const moveModule = useCallback((id, dx, dz) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === id
          ? { ...m, x: Math.max(0, Math.min(1000, m.x + dx)), z: Math.max(0, Math.min(1000, m.z + dz)) }
          : m
      )
    );
  }, []);

  const saveLayout = useCallback(async () => {
    try {
      const payload = { modules, public: isPublic };
      if (currentLayoutId && !String(currentLayoutId).startsWith('demo-')) {
        payload.id = currentLayoutId;
      }
      const data = await apiFetch('/api/layouts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast(`已保存: ${data.name}`, 'success');
      setCurrentLayoutId(data.id);
      setIsOwner(true);
      setIsPublic(data.public || false);
      fetchLayouts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [modules, currentLayoutId, isPublic, showToast, fetchLayouts]);

  const loadLayout = useCallback((layoutId, layoutModules, demo = false, owner = true, pub = false) => {
    setCurrentLayoutId(layoutId);
    setModules(layoutModules);
    setIsDemo(demo);
    setIsOwner(owner);
    setIsPublic(pub);
  }, []);

  const newLayout = useCallback(() => {
    setModules([]);
    setCurrentLayoutId(null);
    setIsDemo(false);
    setIsOwner(true);
    setIsPublic(false);
  }, []);

  const togglePublic = useCallback(() => {
    setIsPublic((prev) => !prev);
  }, []);

  const deleteLayout = useCallback(
    async (id) => {
      try {
        await apiFetch(`/api/layouts?id=${id}`, { method: 'DELETE' });
        showToast('布局已删除', 'success');
        fetchLayouts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    },
    [showToast, fetchLayouts]
  );

  const clearModules = useCallback(() => {
    setModules([]);
    setCurrentLayoutId(null);
    setIsDemo(false);
    setIsOwner(true);
    setIsPublic(false);
  }, []);

  // isEditable: can modify modules (owner of non-demo layout, or new layout)
  const isEditable = isOwner && !isDemo;

  return (
    <LayoutContext.Provider
      value={{
        modules,
        currentLayoutId,
        savedLayouts,
        isDemo,
        isOwner,
        isPublic,
        isEditable,
        fetchLayouts,
        createModule,
        deleteModule,
        updateModule,
        moveModule,
        saveLayout,
        loadLayout,
        deleteLayout,
        newLayout,
        togglePublic,
        clearModules,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}
