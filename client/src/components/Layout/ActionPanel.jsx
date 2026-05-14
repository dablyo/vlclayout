import { useLayouts } from '../../hooks/useLayouts';
import { useScene } from '../../hooks/useScene';

export default function ActionPanel() {
  const { modules, isDemo, isOwner, isPublic, isEditable, currentLayoutId, createModule, deleteModule, saveLayout, newLayout, togglePublic } = useLayouts();
  const { selectedModuleId: sceneSelectedId, toggleCoverage, showCoverage, resetCamera } = useScene();

  const hasSelected = sceneSelectedId !== null;

  const handleNewLayout = () => {
    newLayout();
    resetCamera();
  };

  return (
    <div className="sidebar-section">
      <h3>操作</h3>
      <div className="action-buttons">
        <button className="btn" onClick={handleNewLayout}>
          新建布局
        </button>
        <button className="btn" onClick={createModule} disabled={!isEditable}>
          创建模块
        </button>
        <button className="btn btn-danger" onClick={() => deleteModule(sceneSelectedId)} disabled={!hasSelected || !isEditable}>
          删除模块
        </button>
        <button className="btn btn-primary" onClick={saveLayout} disabled={modules.length === 0 || !isOwner}>
          保存布局
        </button>
      </div>
      <div className="toggle-row">
        <input
          type="checkbox"
          checked={showCoverage}
          onChange={toggleCoverage}
          id="coverage-toggle"
        />
        <label htmlFor="coverage-toggle">显示覆盖区域</label>
      </div>
      {isOwner && !isDemo && (
        <div className="toggle-row">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={togglePublic}
            id="public-toggle"
          />
          <label htmlFor="public-toggle">公开布局</label>
        </div>
      )}
    </div>
  );
}
