import { useLayouts } from '../../hooks/useLayouts';
import { useScene } from '../../hooks/useScene';

export default function PropertyPanel() {
  const { modules, isEditable, updateModule } = useLayouts();
  const { selectedModuleId } = useScene();

  const selectedModule = modules.find((m) => m.id === selectedModuleId);

  if (!selectedModule) return null;

  return (
    <div className="sidebar-section">
      <h3>模块属性</h3>
      <div className="prop-row">
        <label>模块编号</label>
        <div className="readonly">{selectedModule.id}</div>
      </div>
      <div className="prop-row">
        <label>高度 (200-250 cm)</label>
        <div className="prop-value">
          <input
            type="range"
            min={200}
            max={250}
            step={1}
            value={selectedModule.height}
            disabled={!isEditable}
            onChange={(e) => updateModule(selectedModule.id, { height: Number(e.target.value) })}
          />
          <input
            type="number"
            min={200}
            max={250}
            step={1}
            value={selectedModule.height}
            disabled={!isEditable}
            onChange={(e) => {
              let v = Number(e.target.value);
              if (v < 200) v = 200;
              if (v > 250) v = 250;
              updateModule(selectedModule.id, { height: v });
            }}
          />
          <span className="unit">cm</span>
        </div>
      </div>
      <div className="prop-row">
        <label>覆盖角 (78-110°)</label>
        <div className="prop-value">
          <input
            type="range"
            min={78}
            max={110}
            step={0.1}
            value={selectedModule.angle}
            disabled={!isEditable}
            onChange={(e) => updateModule(selectedModule.id, { angle: Number(e.target.value) })}
          />
          <input
            type="number"
            min={78}
            max={110}
            step={0.1}
            value={selectedModule.angle}
            disabled={!isEditable}
            onChange={(e) => {
              let v = Number(e.target.value);
              if (v < 78) v = 78;
              if (v > 110) v = 110;
              updateModule(selectedModule.id, { angle: v });
            }}
          />
          <span className="unit">°</span>
        </div>
      </div>
      <div className="prop-row">
        <label>位置</label>
        <div className="readonly">
          X: {selectedModule.x.toFixed(0)} cm, Z: {selectedModule.z.toFixed(0)} cm
        </div>
      </div>
      <div className="prop-row">
        <label>颜色</label>
        <div className="readonly">
          <span className="color-swatch" style={{ background: selectedModule.color }} />
          {selectedModule.color}
        </div>
      </div>
    </div>
  );
}
