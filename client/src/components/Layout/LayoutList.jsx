import { useEffect } from 'react';
import LayoutItem from './LayoutItem';
import { useLayouts } from '../../hooks/useLayouts';
import { useScene } from '../../hooks/useScene';
import { GEODYM_LAYOUT, QUADGEO_LAYOUT } from '../../utils/demoLayouts';

export default function LayoutList() {
  const { savedLayouts, fetchLayouts, loadLayout, deleteLayout, currentLayoutId } = useLayouts();
  const { resetCamera } = useScene();

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  const handleLoadDemo = (layoutId, modules) => {
    loadLayout(layoutId, modules, true, true, false);
    resetCamera();
  };

  const handleLoadSaved = (layout) => {
    loadLayout(layout.id, layout.modules, false, layout.isOwner, layout.public);
    resetCamera();
  };

  const ownLayouts = savedLayouts.filter((l) => l.isOwner);
  const otherLayouts = savedLayouts.filter((l) => !l.isOwner);

  return (
    <div className="sidebar-section">
      <h3>布局列表</h3>
      <LayoutItem
        name={GEODYM_LAYOUT.name}
        isDemo
        isActive={currentLayoutId === GEODYM_LAYOUT.id}
        onClick={() => handleLoadDemo(GEODYM_LAYOUT.id, GEODYM_LAYOUT.modules)}
      />
      <LayoutItem
        name={QUADGEO_LAYOUT.name}
        isDemo
        isActive={currentLayoutId === QUADGEO_LAYOUT.id}
        onClick={() => handleLoadDemo(QUADGEO_LAYOUT.id, QUADGEO_LAYOUT.modules)}
      />
      {ownLayouts.map((layout) => (
        <LayoutItem
          key={layout.id}
          name={layout.name}
          isDemo={false}
          isOwner={true}
          isPublic={layout.public}
          isActive={currentLayoutId === layout.id}
          onClick={() => handleLoadSaved(layout)}
          onDelete={() => deleteLayout(layout.id)}
        />
      ))}
      {otherLayouts.length > 0 && (
        <>
          <div style={{ fontSize: 12, color: '#999', marginTop: 8, marginBottom: 4 }}>公开布局</div>
          {otherLayouts.map((layout) => (
            <LayoutItem
              key={layout.id}
              name={`${layout.name} (${layout.author})`}
              isDemo={false}
              isOwner={false}
              isPublic={true}
              isActive={currentLayoutId === layout.id}
              onClick={() => handleLoadSaved(layout)}
            />
          ))}
        </>
      )}
    </div>
  );
}
